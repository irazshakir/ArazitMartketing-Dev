import express from 'express';
import { createClient } from '@supabase/supabase-js';
const router = express.Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to generate temporary password
const generateTemporaryPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

router.post('/create-user', async (req, res) => {
  try {
    const { name, email, role_id, user_is_active } = req.body;
    const tempPassword = generateTemporaryPassword();

    // 1. Create user with admin rights
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true
    });

    if (authError) throw authError;

    // 2. Create user in database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        name: name,
        email: email,
        role_id: role_id,
        user_is_active: user_is_active,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        activated_at: new Date().toISOString(),
        inactivated_at: null
      }]);

    if (dbError) throw dbError;

    res.json({ 
      success: true, 
      tempPassword,
      user: { email, name }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}); 

export default router; 