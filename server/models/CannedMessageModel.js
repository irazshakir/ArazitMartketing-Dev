import { supabase } from '../config/database.js';

export const CannedMessageModel = {
  findAll: async () => {
    try {
      const { data, error } = await supabase
        .from('canned_messages')
        .select('id, title, message')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
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