import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signUp({ email, password, name, roleId }) {
    try {
      // 1. Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // 2. Create user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name,
            email,
            role_id: roleId,
            user_is_active: true,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      return { authData, userData };
    } catch (error) {
      throw error;
    }
  },

  async signIn({ email, password }) {
    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Get user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      // 3. Verify user is active and email is verified
      if (!userData.user_is_active) {
        throw new Error('Account is inactive');
      }

      if (!userData.email_verified) {
        throw new Error('Email not verified');
      }

      return { authData, userData };
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    return await supabase.auth.signOut();
  },
}; 