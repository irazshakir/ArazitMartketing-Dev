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

      // 4. Deactivate any existing active sessions for this user
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('user_id', userData.id)
        .eq('is_active', true);

      // 5. Create new session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          user_id: userData.id,
          token: Date.now().toString(),
          ip_address: window.clientInformation?.userAgentData?.platform || 'unknown',
          user_agent: navigator.userAgent,
          is_active: true,
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

      // 6. Store session and user data
      localStorage.setItem('session', JSON.stringify(sessionData));
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        session: sessionData,
        userData,
        token: sessionData.token
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
            is_active: false, // Using boolean false
            last_activity_at: new Date().toISOString()
          })
          .eq('id', session.id);
      }

      localStorage.removeItem('session');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  },

  async getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem('session');
      const userStr = localStorage.getItem('user');
      
      if (!sessionStr || !userStr) return null;

      const session = JSON.parse(sessionStr);
      const userData = JSON.parse(userStr);
      
      // Check if session exists and is active in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', session.id)
        .eq('is_active', true)
        .single();

      if (sessionError || !sessionData) {
        // Clear local storage if session is invalid
        localStorage.removeItem('session');
        localStorage.removeItem('user');
        return null;
      }

      // Return the stored user data if session is valid
      return {
        session: sessionData,
        userData: userData
      };
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('session');
      localStorage.removeItem('user');
      return null;
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