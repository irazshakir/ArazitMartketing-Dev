import express from 'express';
import { supabase } from '../server.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { user } = await supabase.auth.getUser(req.headers.authorization);
    
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    res.json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 