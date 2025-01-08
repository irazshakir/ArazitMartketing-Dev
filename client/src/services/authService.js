import { supabase } from '../lib/supabaseClient';

export const authService = {
  async signIn({ email, password }) {
    try {
      // 1. Check user credentials against users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', email)
        .single();

      if (userError) throw new Error('User not found');
      
      // 2. Verify password
      if (userData.password !== password) {
        throw new Error('Invalid credentials');
      }

      // 3. Check if user is active
      if (!userData.user_is_active) {
        throw new Error('Your account is inactive. Please contact administrator.');
      }

      // 4. Create session in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          user_id: userData.id,
          token: Date.now().toString(), // This will be replaced by JWT token
          ip_address: window.clientInformation?.userAgentData?.platform || 'unknown',
          user_agent: navigator.userAgent,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          device_info: {
            platform: window.clientInformation?.userAgentData?.platform,
            mobile: window.clientInformation?.userAgentData?.mobile,
            browser: navigator.userAgent
          }
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 5. Store session in localStorage
      localStorage.setItem('session', JSON.stringify(sessionData));

      return {
        session: sessionData,
        userData
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  async signOut() {
    try {
      const sessionStr = localStorage.getItem('session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        
        // Update session status in database
        await supabase
          .from('sessions')
          .update({ 
            is_active: false,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', session.id);
      }

      localStorage.removeItem('session');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  async getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr);
      
      // Check if session exists and is active in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*, users(*, roles(*))')
        .eq('id', session.id)
        .eq('is_active', true)
        .single();

      if (sessionError || !sessionData) {
        localStorage.removeItem('session');
        return null;
      }

      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        // Update session status in database
        await supabase
          .from('sessions')
          .update({ 
            is_active: false,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', session.id);

        localStorage.removeItem('session');
        return null;
      }

      // Update last activity
      await supabase
        .from('sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id);

      return {
        session: sessionData,
        userData: sessionData.users
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error(error.message || 'Failed to get current user');
    }
  },

  async updateSession(sessionId) {
    try {
      await supabase
        .from('sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Update session error:', error);
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