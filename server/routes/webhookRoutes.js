import express from 'express';
import { 
  receiveMessage, 
  replyMessage, 
  verifyWebhook,
  getMessages,
  getLastMessageTime,
  getFilteredChats,
  getUnreadChatCounts,
  markMessagesAsRead
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
  getFilteredChats(req, res);
});

// Add new route for unread chat counts
router.get('/webhook/unread-counts', getUnreadChatCounts);

// Add new route for marking messages as read
router.post('/webhook/messages/:leadId/read', markMessagesAsRead);

export default router;