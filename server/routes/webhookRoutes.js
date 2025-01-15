import express from 'express';
import { 
  receiveMessage, 
  replyMessage, 
  verifyWebhook,
  getMessages,
  getLastMessageTime 
} from '../controllers/webhookController.js';

const router = express.Router();

// Webhook verification route
router.get('/webhook/messages', verifyWebhook);

// Webhook route for receiving messages
router.post('/webhook/messages', receiveMessage);

// Route for replying to messages
router.post('/webhook/reply', replyMessage);

// New route to fetch messages
router.get('/webhook/messages/:leadId', getMessages);

// Add this new route
router.get('/messages/last-message-time/:chatId', getLastMessageTime);

export default router;