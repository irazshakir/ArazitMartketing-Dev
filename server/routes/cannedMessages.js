import express from 'express';
import { getAllCannedMessages, getCannedMessageById } from '../controllers/cannedMessageController.js';
import { supabase } from '../config/database.js';

const router = express.Router();

// Middleware to check authentication
const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: session, error } = await supabase.auth.getSession(token);
    if (error || !session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

router.get('/canned-messages', checkAuth, getAllCannedMessages);
router.get('/canned-messages/:id', checkAuth, getCannedMessageById);

export default router; 