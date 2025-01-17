import { ReportsModel } from '../models/index.js';

const ReportsController = {
  getReportsStats: async (req, res) => {
    try {
      const { branchId, startDate, endDate } = req.query;
      
      console.log('Reports Controller - Received query params:', req.query);
      
      // Get current date and first day of current month
      const currentDate = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const currentMonthStart = firstDayOfMonth.toISOString().split('T')[0];

      // Validate date parameters
      const hasValidDateRange = startDate && endDate && 
        !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate));

      // Get reports stats
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
      console.error('Reports Controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching reports statistics',
        error: error.message
      });
    }
  }
};

export default ReportsController; 