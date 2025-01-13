import supabase from '../config/database.js';

const AccountModel = {
  create: async (accountData) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  findAll: async ({ search, timeRange, startDate, endDate, type } = {}) => {
    try {
      let query = supabase
        .from('accounts')
        .select('*');

      // Add search filter if provided
      if (search && search.trim()) {
        query = query.or(`
          client_name.ilike.%${search.trim()}%,
          notes.ilike.%${search.trim()}%
        `);
      }

      // Add type filter if provided
      if (type) {
        query = query.eq('payment_type', type);
      }

      // Handle date filtering
      if (timeRange) {
        const now = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        switch(timeRange) {
          case '7days':
            const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
            query = query.gte('payment_date', formatDate(sevenDaysAgo));
            break;
          case '30days':
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
            query = query.gte('payment_date', formatDate(thirtyDaysAgo));
            break;
          case '90days':
            const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
            query = query.gte('payment_date', formatDate(ninetyDaysAgo));
            break;
          case 'currMonth':
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            query = query
              .gte('payment_date', formatDate(firstDayOfMonth))
              .lte('payment_date', formatDate(lastDayOfMonth));
            break;
          case 'prevMonth':
            const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            query = query
              .gte('payment_date', formatDate(firstDayOfPrevMonth))
              .lte('payment_date', formatDate(lastDayOfPrevMonth));
            break;
        }
      } else if (startDate && endDate) {
        query = query
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);
      }

      // Order by payment date descending
      query = query.order('payment_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      throw error;
    }
  },

  getStats: async (timeRange) => {
    try {
      const accounts = await AccountModel.findAll({ timeRange });
      
      return {
        received: accounts
          .filter(acc => acc.payment_type === 'Received')
          .reduce((sum, acc) => sum + Number(acc.amount), 0),
        expenses: accounts
          .filter(acc => acc.payment_type === 'Expenses')
          .reduce((sum, acc) => sum + Number(acc.amount), 0),
        pending: accounts
          .filter(acc => acc.payment_type === 'Payments')
          .reduce((sum, acc) => sum + Number(acc.amount), 0),
        total: accounts
          .reduce((sum, acc) => {
            const amount = Number(acc.amount);
            return sum + (acc.payment_credit_debit === 'credit' ? amount : -amount);
          }, 0)
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (id, accountData) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(accountData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default AccountModel; 