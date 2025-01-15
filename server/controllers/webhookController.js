// server/controllers/webhookController.js
import { sendMessage, deleteMessage as deleteWhatsAppMessage } from '../services/WhatsappService.js';
import { supabase } from '../config/database.js';

// Handle webhook verification from Meta
export const verifyWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    res.sendStatus(500);
  }
};

// Handle incoming messages
export const receiveMessage = async (req, res) => {
  try {
    const { body } = req;
    console.log('📩 Webhook received:', JSON.stringify(body, null, 2));
    
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && 
          body.entry[0].changes && 
          body.entry[0].changes[0] && 
          body.entry[0].changes[0].value.messages && 
          body.entry[0].changes[0].value.messages[0]
      ) {
        const messageData = body.entry[0].changes[0].value.messages[0];
        const phone = messageData.from;
        
        console.log('📱 Processing message from:', phone);
        console.log('💬 Message data:', messageData);

        // Check if lead exists
        let { data: lead, error: leadQueryError } = await supabase
          .from('leads')
          .select('*')
          .eq('phone', phone)
          .single();

        if (leadQueryError) {
          console.error('❌ Error querying lead:', leadQueryError);
        }

        console.log('🔍 Existing lead:', lead);

        // Store the message with appropriate lead information
        const timestamp = messageData.timestamp 
          ? new Date(messageData.timestamp * 1000)
          : new Date();

        if (!lead) {
          // Create new lead only if it doesn't exist
          console.log('➕ Creating new lead for:', phone);
          const currentDate = new Date();
          
          const { data: newLead, error: createError } = await supabase
            .from('leads')
            .insert([{
              name: `WhatsApp Lead (${phone})`,
              phone: phone,
              assigned_user: null, // Explicitly set as null for unassigned
              lead_source_id: 7,
              lead_stage: 1,
              lead_active_status: true,
              fu_date: currentDate,
              fu_hour: null,
              fu_minutes: null,
              fu_period: null,
              created_at: currentDate,
              updated_at: currentDate
            }])
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating lead:', createError);
            throw createError;
          }
          
          console.log('✅ New lead created:', newLead);
          lead = newLead;
        }

        // Store the message
        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            lead_id: lead.id,
            phone: phone,
            message: messageData.text?.body,
            timestamp: timestamp.toISOString(),
            is_outgoing: false
          }]);

        if (messageError) {
          console.error('❌ Error storing message:', messageError);
          throw messageError;
        }

        // After storing the message, get updated unread counts
        const { data: chats, error: countError } = await supabase
          .from('leads')
          .select(`
            id,
            assigned_user,
            messages (
              id,
              is_read,
              is_outgoing
            )
          `)
          .eq('messages.is_read', false)
          .eq('messages.is_outgoing', false);

        if (!countError) {
          const counts = {
            unassigned: 0,
            mine: 0,
            perChat: {}
          };

          chats.forEach(chat => {
            if (chat.messages && chat.messages.length > 0) {
              if (chat.assigned_user === null) {
                counts.unassigned++;
              } else if (chat.assigned_user === lead.assigned_user) {
                counts.mine++;
              }
            }
          });

          // Get unread count for this specific chat
          const { count: chatCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('lead_id', lead.id)
            .eq('is_read', false)
            .eq('is_outgoing', false);

          counts.perChat[lead.id] = chatCount;

          if (lead.assigned_user === null) {
            counts.unassigned++;
          } else {
            counts.mine++;
          }

          // Emit socket event with updated counts
          req.app.io.emit('unread_counts_update', counts);
        }

        // Emit socket event with lead info and assigned status
        const socketData = {
          ...messageData,
          leadId: lead.id,
          name: lead.name,
          assigned_user: lead.assigned_user
        };
        console.log('🔌 Emitting socket event:', socketData);
        req.app.io.emit('new_whatsapp_message', socketData);

        res.sendStatus(200);
      }
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get messages for a lead
export const getMessages = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send a reply to a message
export const replyMessage = async (req, res) => {
  const { recipient, text } = req.body;
  try {
    if (!recipient || !text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient and text are required' 
      });
    }

    const response = await sendMessage(recipient, text);
    const timestamp = Math.floor(Date.now() / 1000); // Current server timestamp

    // Store the outgoing message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{
        lead_id: req.body.leadId,
        phone: recipient,
        message: text,
        timestamp: new Date(),
        is_outgoing: true
      }])
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error storing outgoing message:', messageError);
    }

    res.status(200).json({ 
      success: true, 
      data: response,
      timestamp: timestamp,
      messageId: messageData?.id
    });
  } catch (error) {
    console.error('❌ Error sending reply:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Add this new controller function
export const getLastMessageTime = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('timestamp, message')  // Also select the message content
      .eq('lead_id', chatId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;

    const lastMessage = messages && messages.length > 0 ? {
      timestamp: messages[0].timestamp,
      message: messages[0].message?.substring(0, 30) + '...' // Truncate message to first 30 chars
    } : null;

    res.status(200).json({
      success: true,
      ...lastMessage
    });
  } catch (error) {
    console.error('Error fetching last message time:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get filtered chats with strict filtering
export const getFilteredChats = async (req, res) => {
  try {
    const { filter } = req.query;
    const { user_id } = req.query;

    console.log('Starting getFilteredChats with filter:', filter);

    let query = supabase
      .from('leads')
      .select(`
        *,
        users!leads_assigned_user_fkey (
          id,
          name,
          role_id,
          user_is_active
        ),
        messages (
          message,
          timestamp,
          is_outgoing
        )
      `);

    // Apply strict filters at database level
    switch (filter) {
      case 'unassigned':
        console.log('Filtering strictly unassigned chats');
        query = query.is('assigned_user', null);
        break;

      case 'mine':
        console.log('Filtering my chats for user_id:', user_id);
        query = query.eq('assigned_user', user_id);
        break;

      case 'open':
        console.log('Filtering open chats');
        query = query.eq('lead_active_status', true);
        break;

      case 'resolved':
        console.log('Filtering resolved chats');
        query = query.eq('lead_active_status', false);
        break;
    }

    // Add ordering by latest update
    query = query.order('updated_at', { ascending: false });

    const { data: chats, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Found ${chats?.length} chats for filter: ${filter}`);

    res.status(200).json({
      success: true,
      data: chats
    });

  } catch (error) {
    console.error('Error in getFilteredChats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Add new endpoint to track unread messages per tab
export const getUnreadChatCounts = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    // Get all chats with their unread messages
    const { data: chats, error: chatsError } = await supabase
      .from('leads')
      .select(`
        id,
        assigned_user,
        messages (
          id,
          is_read,
          is_outgoing
        )
      `);

    if (chatsError) throw chatsError;

    // Initialize counts object
    const counts = {
      unassigned: 0,
      mine: 0,
      perChat: {}
    };

    // Use Promise.all instead of forEach for async operations
    await Promise.all(chats.map(async (chat) => {
      // Get unread message count for this chat
      const { count: unreadCount, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('lead_id', chat.id)
        .eq('is_read', false)
        .eq('is_outgoing', false);

      if (!countError && unreadCount > 0) {
        counts.perChat[chat.id] = unreadCount;
        
        if (chat.assigned_user === null) {
          counts.unassigned++;
        } else if (chat.assigned_user === parseInt(user_id)) {
          counts.mine++;
        }
      }
    }));

    console.log('Unread counts:', counts); // Debug log

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error getting unread chat counts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add new function to mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { user_id } = req.query;

    console.log('Marking messages as read for lead:', leadId);

    // Update all unread messages for this lead to read
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('lead_id', leadId)
      .eq('is_outgoing', false)
      .eq('is_read', false);

    if (updateError) throw updateError;

    // Get all chats with unread messages
    const { data: chats, error: chatsError } = await supabase
      .from('leads')
      .select(`
        id,
        assigned_user,
        messages (
          id,
          is_read,
          is_outgoing
        )
      `);

    if (chatsError) throw chatsError;

    // Initialize counts
    const counts = {
      unassigned: 0,
      mine: 0,
      perChat: {}
    };

    // Use Promise.all for async operations
    await Promise.all(chats.map(async (chat) => {
      const { count: unreadCount, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('lead_id', chat.id)
        .eq('is_read', false)
        .eq('is_outgoing', false);

      if (!countError && unreadCount > 0) {
        counts.perChat[chat.id] = unreadCount;
        
        if (chat.assigned_user === null) {
          counts.unassigned++;
        } else if (chat.assigned_user === parseInt(user_id)) {
          counts.mine++;
        }
      }
    }));

    // Emit updated counts via socket
    req.app.io.emit('unread_counts_update', counts);

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
