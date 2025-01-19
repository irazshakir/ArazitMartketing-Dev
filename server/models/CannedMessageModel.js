import { supabase } from '../config/database.js';

export const CannedMessageModel = {
  findAll: async () => {
    try {
      // Log the query for debugging
      console.log('Fetching canned messages from database');
      
      const { data, error } = await supabase
        .from('canned_messages')
        .select('id, title, message') // Verify these column names match your table
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Fetched canned messages:', data);
      return data;
    } catch (error) {
      console.error('Error in CannedMessageModel.findAll:', error);
      throw error;
    }
  },

  findByPk: async (id) => {
    try {
      const { data, error } = await supabase
        .from('canned_messages')
        .select('id, title, message')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
}; 