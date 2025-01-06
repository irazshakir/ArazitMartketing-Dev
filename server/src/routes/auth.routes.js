import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Create new user (can be used by admin/manager through forms)
router.post('/create-user', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role_id,
      user_is_active = true,
      email_verified = false
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role_id) {
      throw new Error('Missing required fields');
    }

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: email_verified, // Admin can set if email is pre-verified
      user_metadata: {
        name,
        role_id
      }
    });

    if (authError) throw authError;

    // 2. Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          role_id,
          user_is_active,
          email_verified,
          email_verified_at: email_verified ? new Date().toISOString() : null,
          activated_at: user_is_active ? new Date().toISOString() : null
        },
      ])
      .select('*, roles(*)')
      .single();

    if (userError) throw userError;

    res.status(200).json({
      status: 'success',
      message: 'User created successfully',
      data: userData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Regular signup (for self-registration if needed)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // For self-signup, assign default role (e.g., 'user' role)
    const defaultRoleId = 3; // Assuming 3 is the 'user' role ID

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role_id: defaultRoleId
        }
      }
    });

    if (authError) throw authError;

    // 2. Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          role_id: defaultRoleId,
          user_is_active: true,
          email_verified: false
        },
      ])
      .select('*, roles(*)')
      .single();

    if (userError) throw userError;

    res.status(200).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email.',
      data: userData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Get user data including role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, roles(*)')
      .eq('email', email)
      .single();

    if (userError) throw userError;

    // Check if user is active
    if (!userData.user_is_active) {
      throw new Error('Account is inactive');
    }

    res.status(200).json({
      status: 'success',
      message: 'Signed in successfully',
      data: {
        user: userData,
        session: authData.session
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      password, // Optional password update
      role_id,
      user_is_active,
      email_verified 
    } = req.body;

    // 1. Update auth user if email or password changed
    if (email || password) {
      const updateData = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const { error: authError } = await supabase.auth.admin.updateUserById(
        id,
        updateData
      );

      if (authError) throw authError;
    }

    // 2. Update user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({
        name,
        email,
        role_id,
        user_is_active,
        email_verified,
        email_verified_at: email_verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, roles(*)')
      .single();

    if (userError) throw userError;

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: userData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router; 