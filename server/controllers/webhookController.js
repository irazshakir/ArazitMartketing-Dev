// server/controllers/webhookController.js
import { sendMessage, deleteMessage as deleteWhatsAppMessage } from '../services/WhatsappService.js';

// Handle webhook verification from Meta
export const verifyWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        // Respond with 200 OK and challenge token from the request
        console.log('✅ WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
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
    
    console.log('\n📩 Received Webhook Event:');
    console.log('Full payload:', JSON.stringify(body, null, 2));

    // Handle incoming messages
    if (body.object === 'whatsapp_business_account') {
      if (body.entry && 
          body.entry[0].changes && 
          body.entry[0].changes[0] && 
          body.entry[0].changes[0].value.messages && 
          body.entry[0].changes[0].value.messages[0]
      ) {
        const messageData = body.entry[0].changes[0].value.messages[0];
        
        // Log message details in a readable format
        console.log('\n📱 New WhatsApp Message:');
        console.log('------------------');
        console.log('From:', messageData.from);
        console.log('Time:', new Date(messageData.timestamp * 1000).toLocaleString());
        console.log('Type:', messageData.type);
        console.log('Message:', messageData.text?.body);
        console.log('Message ID:', messageData.id);
        console.log('------------------\n');

        res.status(200).json({ success: true });
      } else {
        console.log('📝 Received webhook event but no message data');
        res.sendStatus(200); // WhatsApp expects a 200 response
      }
    } else {
      console.log('❓ Unknown webhook object type:', body.object);
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
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
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message ID is required' 
      });
    }

    const response = await deleteWhatsAppMessage(id);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
