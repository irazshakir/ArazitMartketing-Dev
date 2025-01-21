import { DashboardModel } from '../models/index.js';

const DashboardController = {
  getDashboardStats: async (req, res) => {
    try {
      const { branchId, startDate, endDate } = req.query;
      
      const currentDate = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const currentMonthStart = firstDayOfMonth.toISOString().split('T')[0];

      const hasValidDateRange = startDate && endDate && 
        !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate));

      const [stats, leadsVsClosedStats] = await Promise.all([
        DashboardModel.getDashboardStats({
          currentDate,
          currentMonthStart,
          branchId: branchId || 'all',
          startDate: hasValidDateRange ? startDate : undefined,
          endDate: hasValidDateRange ? endDate : undefined
        }),
        DashboardModel.getLeadsVsClosedStats({
          currentMonthStart,
          currentDate,
          branchId: branchId || 'all',
          startDate: hasValidDateRange ? startDate : undefined,
          endDate: hasValidDateRange ? endDate : undefined
        })
      ]);

      res.json({
        success: true,
        data: {
          ...stats,
          leadsVsClosedStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      });
    }
  },

  getLeadConversionStats: async (req, res) => {
    try {
      const { timeRange, branchId } = req.query;
      
      const stats = await DashboardModel.getLeadConversionStats({
        timeRange,
        branchId
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching lead conversion statistics',
        error: error.message
      });
    }
  },

  getBranches: async (req, res) => {
    try {
      const branches = await DashboardModel.getBranches();
      
      res.json({
        success: true,
        data: branches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching branches',
        error: error.message
      });
    }
  }
};

export default DashboardController;