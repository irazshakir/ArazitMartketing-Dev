import { supabase } from '../config/database.js';

const VALID_CITIES = ['Makkah', 'Medinah'];
const VALID_HOTEL_STARS = ['5', '4', '3', 'Economy', 'Sharing'];
const VALID_ROOM_TYPES = ['Quint', 'Quad', 'Triple', 'Double', 'Economy', 'Sharing'];

const CustomUmrahHotelModel = {
  findAll: async (leadId) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_hotels')
        .select(`
          id,
          lead_id,
          umrah_city,
          hotel_name,
          checkin_date,
          checkout_date,
          hotel_star,
          room_type,
          number_of_rooms,
          hotel_price,
          created_at,
          updated_at,
          custom_umrah_services (
            id,
            service_name,
            description,
            price,
            created_at,
            updated_at
          ),
          custom_umrah_prices (
            id,
            quotation_amount,
            buying_amount,
            profit,
            created_at,
            updated_at
          )
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  findOne: async (id) => {
    try {
      const { data, error } = await supabase
        .from('custom_umrah_hotels')
        .select(`
          *,
          custom_umrah_services (
            id,
            service_name,
            description,
            price
          ),
          custom_umrah_prices (
            id,
            quotation_amount,
            buying_amount,
            profit
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (hotelData) => {
    // Validate enum fields
    if (!VALID_CITIES.includes(hotelData.umrah_city)) {
      throw new Error('Invalid city');
    }
    if (!VALID_HOTEL_STARS.includes(hotelData.hotel_star)) {
      throw new Error('Invalid hotel star rating');
    }
    if (!VALID_ROOM_TYPES.includes(hotelData.room_type)) {
      throw new Error('Invalid room type');
    }

    try {
      const { data, error } = await supabase
        .from('custom_umrah_hotels')
        .insert([{
          lead_id: hotelData.lead_id,
          umrah_city: hotelData.umrah_city,
          hotel_name: hotelData.hotel_name,
          checkin_date: hotelData.checkin_date,
          checkout_date: hotelData.checkout_date,
          hotel_star: hotelData.hotel_star,
          room_type: hotelData.room_type,
          number_of_rooms: parseInt(hotelData.number_of_rooms),
          hotel_price: parseFloat(hotelData.hotel_price),
          updated_at: new Date().toISOString()
        }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  },

  update: async (id, hotelData) => {
    // Validate enum fields if they're being updated
    if (hotelData.umrah_city && !VALID_CITIES.includes(hotelData.umrah_city)) {
      throw new Error('Invalid city');
    }
    if (hotelData.hotel_star && !VALID_HOTEL_STARS.includes(hotelData.hotel_star)) {
      throw new Error('Invalid hotel star rating');
    }
    if (hotelData.room_type && !VALID_ROOM_TYPES.includes(hotelData.room_type)) {
      throw new Error('Invalid room type');
    }

    try {
      const updateData = {
        ...hotelData,
        updated_at: new Date().toISOString()
      };

      // Parse numeric fields if they exist
      if (hotelData.number_of_rooms) {
        updateData.number_of_rooms = parseInt(hotelData.number_of_rooms);
      }
      if (hotelData.hotel_price) {
        updateData.hotel_price = parseFloat(hotelData.hotel_price);
      }

      const { data, error } = await supabase
        .from('custom_umrah_hotels')
        .update(updateData)
        .eq('id', id)
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
        .from('custom_umrah_hotels')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default CustomUmrahHotelModel; 