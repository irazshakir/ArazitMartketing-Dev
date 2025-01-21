import { supabase } from '../config/database.js';

const DashboardModel = {
  getDashboardStats: async ({ currentDate, currentMonthStart, branchId, startDate, endDate, timeRange }) => {
    try {
      // 1. Today's Leads
      let todayLeadsQuery = supabase
        .from('leads')
        .select('count')
        .gte('created_at', `${currentDate}T00:00:00`)
        .lt('created_at', `${currentDate}T23:59:59`);

      if (branchId !== 'all') {
        todayLeadsQuery = todayLeadsQuery.eq('branch_id', branchId);
      }

      const { data: todayLeads, error: todayError } = await todayLeadsQuery;

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

      // Active Leads
      let activeLeadsQuery = supabase
        .from('leads')
        .select('count')
        .eq('lead_active_status', true);

      if (branchId !== 'all') {
        activeLeadsQuery = activeLeadsQuery.eq('branch_id', branchId);
      }

      const { data: activeLeads, error: activeError } = await activeLeadsQuery;

      // Hot Active Leads
      let hotActiveLeadsQuery = supabase
        .from('leads')
        .select('count')
        .eq('lead_stage', 3)
        .eq('lead_active_status', true);

      if (branchId !== 'all') {
        hotActiveLeadsQuery = hotActiveLeadsQuery.eq('branch_id', branchId);
      }

      const { data: hotActiveLeads, error: hotActiveError } = await hotActiveLeadsQuery;

      // Sales Leads (Won this month)
      let salesLeadsQuery = supabase
        .from('leads')
        .select('count')
        .eq('lead_stage', 4)
        .gte('won_at', `${currentMonthStart}T00:00:00`)
        .lte('won_at', `${currentDate}T23:59:59`);

      if (branchId !== 'all') {
        salesLeadsQuery = salesLeadsQuery.eq('branch_id', branchId);
      }

      const { data: salesLeads, error: salesError } = await salesLeadsQuery;

      // Check for any errors
      if (todayError || newCustomersError || followupsError || hotError || activeError || hotActiveError || salesError) {
        throw new Error('Error fetching dashboard statistics');
      }

      // Calculate date range based on timeRange or use current month
      let periodStart, periodEnd;
      
      if (timeRange) {
        const today = new Date();
        switch (timeRange) {
          case '7days':
            periodStart = new Date(today);
            periodStart.setDate(today.getDate() - 7);
            periodEnd = today;
            break;
          case 'previousMonth':
            periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            periodEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
          case '90days':
            periodStart = new Date(today);
            periodStart.setDate(today.getDate() - 90);
            periodEnd = today;
            break;
          default:
            periodStart = new Date(currentMonthStart);
            periodEnd = new Date(currentDate);
        }
      } else {
        periodStart = new Date(currentMonthStart);
        periodEnd = new Date(currentDate);
      }

      // Format dates for query
      const queryStartDate = periodStart.toISOString().split('T')[0];
      const queryEndDate = periodEnd.toISOString().split('T')[0];

      // Get total leads created in the period
      let totalLeadsQuery = supabase
        .from('leads')
        .select('count')
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      if (branchId !== 'all') {
        totalLeadsQuery = totalLeadsQuery.eq('branch_id', branchId);
      }

      const { data: totalLeads, error: totalError } = await totalLeadsQuery;

      // Get won leads in the period
      let wonLeadsQuery = supabase
        .from('leads')
        .select('count')
        .eq('lead_stage', 4)
        .gte('won_at', `${queryStartDate}T00:00:00`)
        .lte('won_at', `${queryEndDate}T23:59:59`);

      if (branchId !== 'all') {
        wonLeadsQuery = wonLeadsQuery.eq('branch_id', branchId);
      }

      const { data: wonLeads, error: wonError } = await wonLeadsQuery;

      return {
        todayLeads: todayLeads[0]?.count || 0,
        newCustomers: newCustomers[0]?.count || 0,
        todayFollowups: followups[0]?.count || 0,
        hotLeads: hotLeads[0]?.count || 0,
        activeLeads: activeLeads[0]?.count || 0,
        hotActiveLeads: hotActiveLeads[0]?.count || 0,
        salesLeads: salesLeads[0]?.count || 0,
        totalPeriodLeads: totalLeads[0]?.count || 0,
        periodStart: queryStartDate,
        periodEnd: queryEndDate
      };
    } catch (error) {
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
      throw error;
    }
  },

  getLeadsVsClosedStats: async ({ currentMonthStart, currentDate, branchId, startDate, endDate }) => {
    try {
      // Determine date range
      const queryStartDate = startDate || currentMonthStart;
      const queryEndDate = endDate || currentDate;

      // Get leads created in the period
      let createdLeadsQuery = supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      // Get closed leads in the period
      let closedLeadsQuery = supabase
        .from('leads')
        .select('closed_at')
        .gte('closed_at', `${queryStartDate}T00:00:00`)
        .lte('closed_at', `${queryEndDate}T23:59:59`);

      // Apply branch filter if specified
      if (branchId !== 'all') {
        createdLeadsQuery = createdLeadsQuery.eq('branch_id', branchId);
        closedLeadsQuery = closedLeadsQuery.eq('branch_id', branchId);
      }

      // Execute both queries
      const [createdLeadsResult, closedLeadsResult] = await Promise.all([
        createdLeadsQuery,
        closedLeadsQuery
      ]);

      // Process created leads by month
      const createdLeadsByMonth = processLeadsByMonth(createdLeadsResult.data, 'created_at');
      const closedLeadsByMonth = processLeadsByMonth(closedLeadsResult.data, 'closed_at');

      // Combine data for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = [];

      months.forEach(month => {
        // Add created leads data
        chartData.push({
          month,
          type: 'Leads Created',
          value: createdLeadsByMonth[month] || 0
        });

        // Add closed leads data
        chartData.push({
          month,
          type: 'Leads Closed',
          value: closedLeadsByMonth[month] || 0
        });
      });

      // Get totals for summary
      const totalCreated = Object.values(createdLeadsByMonth).reduce((a, b) => a + b, 0);
      const totalClosed = Object.values(closedLeadsByMonth).reduce((a, b) => a + b, 0);

      return {
        chartData,
        summary: {
          totalCreated,
          totalClosed
        }
      };

    } catch (error) {
      throw error;
    }
  }
};

// Helper function to process leads by month
const processLeadsByMonth = (leads, dateField) => {
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const monthCounts = {};

  leads?.forEach(lead => {
    const date = new Date(lead[dateField]);
    const monthName = Object.keys(months)[date.getMonth()];
    monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
  });

  return monthCounts;
};

export default DashboardModel; 