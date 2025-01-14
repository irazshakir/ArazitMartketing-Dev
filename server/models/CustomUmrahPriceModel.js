import { supabase } from '../config/database.js';

const CustomUmrahPriceModel = {
  findByHotelId: async (hotelId) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_prices')
        .select(`
          id,
          custom_umrah_hotel_id,
          quotation_amount,
          buying_amount,
          profit,
          created_at,
          updated_at
        `)
        .eq('custom_umrah_hotel_id', hotelId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (priceData) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_prices')
        .insert([{
          custom_umrah_hotel_id: priceData.custom_umrah_hotel_id,
          quotation_amount: parseFloat(priceData.quotation_amount),
          buying_amount: parseFloat(priceData.buying_amount),
          updated_at: new Date().toISOString()
        }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  update: async (hotelId, priceData) => {
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (priceData.quotation_amount) {
        updateData.quotation_amount = parseFloat(priceData.quotation_amount);
      }
      if (priceData.buying_amount) {
        updateData.buying_amount = parseFloat(priceData.buying_amount);
      }

      const { data, error } = await supabase
        .from('custom_umrah_prices')
        .update(updateData)
        .eq('custom_umrah_hotel_id', hotelId)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('custom_umrah_prices')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default CustomUmrahPriceModel; 