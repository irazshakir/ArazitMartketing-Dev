import express from 'express';
import { 
  receiveMessage, 
  replyMessage, 
  deleteMessage, 
  verifyWebhook 
} from '../controllers/webhookController.js';

const router = express.Router();

// Webhook verification route
router.get('/webhook/messages', verifyWebhook);

// Webhook route for receiving messages
router.post('/webhook/messages', receiveMessage);

// Route for replying to messages
router.post('/webhook/reply', replyMessage);

// Route for deleting messages
router.delete('/webhook/messages/:id', deleteMessage);

export default router;