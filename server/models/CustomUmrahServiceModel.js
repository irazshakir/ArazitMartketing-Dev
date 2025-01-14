import { supabase } from '../config/database.js';

const CustomUmrahServiceModel = {
  findAll: async (hotelId) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_services')
        .select(`
          id,
          custom_umrah_hotel_id,
          service_name,
          description,
          price,
          created_at,
          updated_at
        `)
        .eq('custom_umrah_hotel_id', hotelId);
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (serviceData) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_services')
        .insert([{
          custom_umrah_hotel_id: serviceData.custom_umrah_hotel_id,
          service_name: serviceData.service_name,
          description: serviceData.description,
          price: parseFloat(serviceData.price),
          updated_at: new Date().toISOString()
        }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  update: async (id, serviceData) => {
    try {
      const updateData = {
        ...serviceData,
        updated_at: new Date().toISOString()
      };

      if (serviceData.price) {
        updateData.price = parseFloat(serviceData.price);
      }

      const { data, error } = await supabase
        .from('custom_umrah_services')
        .update(updateData)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  deleteByHotelId: async (hotelId) => {
    try {
      const { error } = await supabase
        .from('custom_umrah_services')
        .delete()
        .eq('custom_umrah_hotel_id', hotelId);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('custom_umrah_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default CustomUmrahServiceModel; 