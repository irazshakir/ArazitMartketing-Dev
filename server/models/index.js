import supabase from '../config/database.js';

export const ProductModel = {
  findAll: async ({ where } = {}) => {
    try {
      let query = supabase
        .from('products')
        .select('id, product_name');
      
      if (where?.is_active) {
        query = query.eq('product_is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const StageModel = {
  findAll: async ({ where } = {}) => {
    try {
      let query = supabase
        .from('stages')
        .select('id, stage_name');
      
      if (where?.is_active) {
        query = query.eq('stage_is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const LeadSourceModel = {
  findAll: async ({ where } = {}) => {
    try {
      let query = supabase
        .from('lead_sources')
        .select('id, lead_source_name');
      
      if (where?.is_active) {
        query = query.eq('lead_source_is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const UserModel = {
  findAll: async ({ where } = {}) => {
    try {
      let query = supabase
        .from('users')
        .select('id, name');
      
      if (where?.is_active) {
        query = query.eq('user_is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const LeadModel = {
  findAll: async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          products!lead_product(product_name),
          stages!lead_stage(stage_name),
          lead_sources!lead_source_id(lead_source_name),
          users!assigned_user(name)
        `);
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (values) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([values])
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
        .from('leads')
        .select()
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
      const updateValues = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        lead_product: values.lead_product,
        lead_stage: values.lead_stage,
        lead_source_id: values.lead_source_id,
        assigned_user: values.assigned_user,
        initial_remarks: values.initial_remarks,
        lead_active_status: values.lead_active_status,
        fu_date: values.fu_date,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('leads')
        .update(updateValues)
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
        .from('leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
}; 