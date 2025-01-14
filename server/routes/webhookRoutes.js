import express from 'express';
import { 
  receiveMessage, 
  replyMessage, 
  verifyWebhook,
  getMessages 
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

export default router;