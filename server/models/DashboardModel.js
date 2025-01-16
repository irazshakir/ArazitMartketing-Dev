import { supabase } from '../config/database.js';

const DashboardModel = {
  getDashboardStats: async ({ currentDate, currentMonthStart, branchId, startDate, endDate }) => {
    try {
      console.log('Query Parameters:', { // Debug log
        currentDate,
        currentMonthStart,
        branchId,
        startDate,
        endDate
      });

      // 1. Today's Leads - Fix date comparison
      let todayLeadsQuery = supabase
        .from('leads')
        .select('count')
        .gte('created_at', `${currentDate}T00:00:00`)
        .lt('created_at', `${currentDate}T23:59:59`);

      if (branchId !== 'all') {
        todayLeadsQuery = todayLeadsQuery.eq('branch_id', branchId);
      }

      const { data: todayLeads, error: todayError } = await todayLeadsQuery;
      console.log('Today Leads Query Result:', { data: todayLeads, error: todayError }); // Debug log

      // 2. New Customers Added - Fix date range
      let newCustomersQuery = supabase
        .from('leads')
        .select('count');

      if (startDate && endDate) {
        newCustomersQuery = newCustomersQuery
          .gte('created_at', `${startDate}T00:00:00`)
          .lt('created_at', `${endDate}T23:59:59`);
      } else {
        newCustomersQuery = newCustomersQuery
          .gte('created_at', `${currentMonthStart}T00:00:00`)
          .lt('created_at', `${currentDate}T23:59:59`);
      }

      if (branchId !== 'all') {
        newCustomersQuery = newCustomersQuery.eq('branch_id', branchId);
      }

      const { data: newCustomers, error: newCustomersError } = await newCustomersQuery;
      console.log('New Customers Query Result:', { data: newCustomers, error: newCustomersError }); // Debug log

      // 3. Today's Followups
      let followupsQuery = supabase
        .from('leads')
        .select('count')
        .eq('fu_date', currentDate);

      if (branchId !== 'all') {
        followupsQuery = followupsQuery.eq('branch_id', branchId);
      }

      const { data: followups, error: followupsError } = await followupsQuery;

      // 4. Hot Stage Leads
      let hotLeadsQuery = supabase
        .from('leads')
        .select('count')
        .eq('lead_stage', 3);

      if (branchId !== 'all') {
        hotLeadsQuery = hotLeadsQuery.eq('branch_id', branchId);
      }

      const { data: hotLeads, error: hotError } = await hotLeadsQuery;

      // Check for any errors
      if (todayError || newCustomersError || followupsError || hotError) {
        console.error('Database Errors:', {
          todayError,
          newCustomersError,
          followupsError,
          hotError
        });
        throw new Error('Error fetching dashboard statistics');
      }

      return {
        todayLeads: todayLeads[0]?.count || 0,
        newCustomers: newCustomers[0]?.count || 0,
        todayFollowups: followups[0]?.count || 0,
        hotLeads: hotLeads[0]?.count || 0
      };
    } catch (error) {
      console.error('DashboardModel Error:', error);
      throw error;
    }
  },

  getBranches: async () => {
    try {
      const { data, error } = await supabase
        .from('company_branches')
        .select('id, branch_name')
        .eq('branch_is_active', true)
        .order('branch_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get Branches Error:', error);
      throw error;
    }
  }
};

export default DashboardModel; 