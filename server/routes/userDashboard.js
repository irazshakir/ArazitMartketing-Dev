import express from 'express';
import UserDashboardController from '../controllers/UserDashboardController.js';
import { supabase } from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to check authentication using JWT
const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if session is active in database
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (sessionError || !session) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired session'
        });
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('id', decoded.userId)
        .single();

      if (userError || !userData) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      req.user = userData;
      next();
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Add new route for generating user token
router.post('/generate-user-token', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and role are required'
      });
    }

    // Verify user exists and is active
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, roles(*)')
      .eq('id', userId)
      .eq('user_is_active', true)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId,
        role,
        email: userData.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // First, deactivate any existing active sessions for this user
    await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Then, create a new session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: userId,
          token,
          is_active: true,
          last_activity_at: new Date().toISOString(),
          ip_address: 'API',
          user_agent: 'API',
          device_info: {
            platform: 'API',
            mobile: false,
            browser: 'API'
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }
      ])
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    res.json({
      status: 'success',
      token,
      session: sessionData
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate token',
      error: error.message
    });
  }
});

router.get('/user-dashboard/stats', checkAuth, UserDashboardController.getUserDashboardStats);
router.get('/user-dashboard/user-report-stats', checkAuth, UserDashboardController.getUserReportStats);

export default router; 