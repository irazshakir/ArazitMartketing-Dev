import { supabase } from '../config/database.js';

const UserDashboardModel = {
  getUserDashboardStats: async ({ currentDate, currentMonthStart, userId, startDate, endDate, timeRange }) => {
    try {
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
          case 'currentMonth':
            periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
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
        periodStart = startDate ? new Date(startDate) : new Date(currentMonthStart);
        periodEnd = endDate ? new Date(endDate) : new Date(currentDate);
      }

      const queryStartDate = periodStart.toISOString().split('T')[0];
      const queryEndDate = periodEnd.toISOString().split('T')[0];

      // New Customers (All leads in date range)
      const { data: newCustomers } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      // Active Leads
      const { data: activeLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_active_status', true);

      // Hot Active Leads
      const { data: hotActiveLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_stage', 3)
        .eq('lead_active_status', true)
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      // Sales Leads (won in date range)
      const { data: salesLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('lead_stage', 4)
        .gte('won_at', `${queryStartDate}T00:00:00`)
        .lte('won_at', `${queryEndDate}T23:59:59`);

      // Total Leads in period (for conversion ratio)
      const { data: totalPeriodLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .gte('created_at', `${queryStartDate}T00:00:00`)
        .lte('created_at', `${queryEndDate}T23:59:59`);

      // Today's stats remain unchanged
      const { data: todayLeads } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .gte('created_at', `${currentDate}T00:00:00`)
        .lt('created_at', `${currentDate}T23:59:59`);

      const { data: todayFollowups } = await supabase
        .from('leads')
        .select('count')
        .eq('assigned_user', userId)
        .eq('fu_date', currentDate);

      return {
        todayLeads: todayLeads?.[0]?.count || 0,
        newCustomers: newCustomers?.[0]?.count || 0,
        todayFollowups: todayFollowups?.[0]?.count || 0,
        activeLeads: activeLeads?.[0]?.count || 0,
        hotActiveLeads: hotActiveLeads?.[0]?.count || 0,
        salesLeads: salesLeads?.[0]?.count || 0,
        totalPeriodLeads: totalPeriodLeads?.[0]?.count || 0,
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