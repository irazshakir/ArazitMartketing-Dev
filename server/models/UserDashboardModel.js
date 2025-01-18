import { supabase } from '../config/database.js';

const UserDashboardModel = {
  getUserDashboardStats: async ({ currentDate, currentMonthStart, userId, startDate, endDate, timeRange }) => {
    try {
      console.log('Model received params:', {
        userId,
        currentDate,
        currentMonthStart,
        startDate,
        endDate,
        timeRange
      });

      if (!userId) {
        throw new Error('User ID is required');
      }

      // 1. Today's Leads
      const { data: todayLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .gte('created_at', `${currentDate}T00:00:00`)
        .lt('created_at', `${currentDate}T23:59:59`);

      // 2. New Customers Added
      let newCustomersQuery = supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId);

      if (startDate && endDate) {
        newCustomersQuery = newCustomersQuery
          .gte('created_at', `${startDate}T00:00:00`)
          .lt('created_at', `${endDate}T23:59:59`);
      } else {
        newCustomersQuery = newCustomersQuery
          .gte('created_at', `${currentMonthStart}T00:00:00`)
          .lt('created_at', `${currentDate}T23:59:59`);
      }

      const { data: newCustomers } = await newCustomersQuery;

      // 3. Today's Followups
      const { data: followups } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('fu_date', currentDate);

      // 4. Hot Stage Leads
      const { data: hotLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_stage', 3);

      // 5. Active Leads
      const { data: activeLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_active_status', true);

      // 6. Hot Active Leads
      const { data: hotActiveLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_stage', 3)
        .eq('lead_active_status', true);

      // 7. Sales Leads
      const { data: salesLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_stage', 4)
        .gte('won_at', `${currentMonthStart}T00:00:00`)
        .lte('won_at', `${currentDate}T23:59:59`);

      // Calculate period dates based on timeRange
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

      const queryStartDate = periodStart.toISOString().split('T')[0];
      const queryEndDate = periodEnd.toISOString().split('T')[0];

      // Get total period leads
      const { data: totalLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      return {
        todayLeads: todayLeads?.[0]?.count || 0,
        newCustomers: newCustomers?.[0]?.count || 0,
        todayFollowups: followups?.[0]?.count || 0,
        hotLeads: hotLeads?.[0]?.count || 0,
        activeLeads: activeLeads?.[0]?.count || 0,
        hotActiveLeads: hotActiveLeads?.[0]?.count || 0,
        salesLeads: salesLeads?.[0]?.count || 0,
        totalPeriodLeads: totalLeads?.[0]?.count || 0,
        periodStart: queryStartDate,
        periodEnd: queryEndDate
      };
    } catch (error) {
      console.error('Model error:', error);
      throw error;
    }
  },

  getUserLeadsVsClosedStats: async ({ currentMonthStart, currentDate, userId, startDate, endDate }) => {
    try {
      // Query leads created by this user
      const { data: createdLeads } = await supabase
        .from('leads')
        .select('created_at')
        .eq('assigned_user', userId)
        .gte('created_at', startDate || currentMonthStart)
        .lte('created_at', endDate || currentDate);

      // Query leads closed by this user
      const { data: closedLeads } = await supabase
        .from('leads')
        .select('closed_at')
        .eq('assigned_user', userId)
        .eq('status', 'closed')
        .gte('closed_at', startDate || currentMonthStart)
        .lte('closed_at', endDate || currentDate);

      // Process the data for charts
      const createdLeadsByMonth = processLeadsByMonth(createdLeads, 'created_at');
      const closedLeadsByMonth = processLeadsByMonth(closedLeads, 'closed_at');

      return {
        chartData: generateChartData(createdLeadsByMonth, closedLeadsByMonth),
        summary: {
          totalCreated: Object.values(createdLeadsByMonth).reduce((a, b) => a + b, 0),
          totalClosed: Object.values(closedLeadsByMonth).reduce((a, b) => a + b, 0)
        }
      };
    } catch (error) {
      console.error('Error in getUserLeadsVsClosedStats:', error);
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

const generateChartData = (createdLeadsByMonth, closedLeadsByMonth) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.flatMap(month => [
    {
      month,
      type: 'Leads Created',
      value: createdLeadsByMonth[month] || 0
    },
    {
      month,
      type: 'Leads Closed',
      value: closedLeadsByMonth[month] || 0
    }
  ]);

  return chartData;
};

export default UserDashboardModel; 