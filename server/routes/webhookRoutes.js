import express from 'express';
import { 
  receiveMessage, 
  replyMessage, 
  verifyWebhook,
  getMessages,
  getLastMessageTime,
  getFilteredChats
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

// Add new route for filtered chats
router.get('/webhook/filtered-chats', (req, res, next) => {
  console.log('Filtered chats route hit with query:', req.query);
  getFilteredChats(req, res);
});

export default router;