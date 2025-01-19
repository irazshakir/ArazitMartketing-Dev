import { supabase } from '../config/database.js';

export const TemplateMessageModel = {
  findAll: async () => {
    try {
      const { data, error } = await supabase
        .from('template_messages')
        .select('id, title, template_message')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (values) => {
    try {
      const { data, error } = await supabase
        .from('template_messages')
        .insert([{
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  findByPk: async (id) => {
    try {
      const { data, error } = await supabase
        .from('template_messages')
        .select('id, title, template_message')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, values) => {
    try {
      const { data, error } = await supabase
        .from('template_messages')
        .update({
          ...values,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  destroy: async (id) => {
    try {
      const { error } = await supabase
        .from('template_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default TemplateMessageModel; 