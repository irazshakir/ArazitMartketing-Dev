import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signIn({ email, password }) {
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // 2. Get user data including role from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      // 3. Check if user is active
      if (!userData.user_is_active) {
        throw new Error('Your account is inactive. Please contact administrator.');
      }

      return {
        session: authData.session,
        userData
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', session.user.email)
        .single();

      if (userError) throw userError;

      return {
        session,
        userData
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error(error.message || 'Failed to get current user');
    }
  },

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset password email');
    }
  }
}; 