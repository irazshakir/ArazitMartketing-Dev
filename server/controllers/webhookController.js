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

        // If lead doesn't exist, create one
        if (!lead) {
          console.log('➕ Creating new lead for:', phone);
          const currentDate = new Date();
          
          const { data: newLead, error: createError } = await supabase
            .from('leads')
            .insert([{
              name: `WhatsApp Lead (${phone})`,
              phone: phone,
              assigned_user: 1, // Admin user
              lead_source_id: 7, // WhatsApp source
              lead_stage: 1, // Initial stage
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
        console.log('💾 Storing message for lead:', lead.id);
        const timestamp = messageData.timestamp 
          ? new Date(messageData.timestamp * 1000) // Convert WhatsApp timestamp to Date
          : new Date();

        const { error: messageError } = await supabase
          .from('messages')
          .insert([{
            lead_id: lead.id,
            phone: phone,
            message: messageData.text?.body,
            timestamp: timestamp.toISOString(), // Store as ISO string
            is_outgoing: false
          }]);

        if (messageError) {
          console.error('❌ Error storing message:', messageError);
          throw messageError;
        }

        // Emit socket event with lead info
        const socketData = {
          ...messageData,
          leadId: lead.id,
          name: lead.name
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
