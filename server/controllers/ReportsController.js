import { ReportsModel } from '../models/index.js';

const ReportsController = {
  getReportsStats: async (req, res) => {
    try {
      const { branchId, startDate, endDate } = req.query;
      
      const currentDate = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const currentMonthStart = firstDayOfMonth.toISOString().split('T')[0];

      const hasValidDateRange = startDate && endDate && 
        !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate));

      const stats = await ReportsModel.getReportsStats({
        currentDate,
        currentMonthStart,
        branchId: branchId || 'all',
        startDate: hasValidDateRange ? startDate : undefined,
        endDate: hasValidDateRange ? endDate : undefined
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching reports statistics',
        error: error.message
      });
    }
  }
};

export default ReportsController; 