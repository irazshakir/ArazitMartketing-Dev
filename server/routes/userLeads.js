import express from 'express';
import UserLeadsController from '../controllers/UserLeadsController.js';
import { supabase } from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Reuse the same checkAuth middleware
const checkAuth = async (req, res, next) => {
  try {
    console.log('UserLeads Route - Auth check for:', {
      method: req.method,
      path: req.path,
      headers: {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        contentType: req.headers['content-type']
      }
    });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('UserLeads Route - Auth Error: Invalid token format');
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('UserLeads Route - Token:', token ? 'Token received' : 'No token');
    
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Check if session is active in database
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      console.log('Session data:', session);
      console.log('Session error:', sessionError);

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

      console.log('User data:', userData);
      console.log('User error:', userError);

      if (userError || !userData) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      req.user = userData;
      next();
    } catch (err) {
      console.error('UserLeads Route - JWT Verification Error:', {
        error: err.message,
        token: token ? 'Present' : 'Missing'
      });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('UserLeads Route - Auth Error:', {
      path: req.path,
      method: req.method,
      error: error.message
    });
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// First, place specific routes before parameterized routes
// User management routes
router.get('/user-leads/current-user', checkAuth, UserLeadsController.getCurrentUser);

// Add this route before parameterized routes
router.get('/user-leads/users', checkAuth, UserLeadsController.getUsers);

// Then, place the parameterized routes
router.get('/user-leads/:id', checkAuth, UserLeadsController.getUserLead);
router.get('/user-leads', checkAuth, UserLeadsController.getUserLeads);

// Notes routes
router.get('/user-leads/:id/notes', checkAuth, UserLeadsController.getUserLeadNotes);
router.post('/user-leads/:id/notes', checkAuth, UserLeadsController.addUserLeadNote);

// Lead management routes
router.patch('/user-leads/:id', checkAuth, UserLeadsController.updateLead);
router.patch('/user-leads/:id/assign', checkAuth, UserLeadsController.assignLead);



export default router; 