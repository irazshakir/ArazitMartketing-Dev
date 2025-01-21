import { UserDashboardModel } from '../models/index.js';
import jwt from 'jsonwebtoken';

const UserDashboardController = {
  getUserDashboardStats: async (req, res) => {
    try {
      // Get user data from middleware
      const userData = req.user;
      const userId = userData.id;

      const { startDate, endDate, timeRange } = req.query;
      const currentDate = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const currentMonthStart = firstDayOfMonth.toISOString().split('T')[0];

      // Get dashboard stats with user ID
      const [stats, leadsVsClosedStats] = await Promise.all([
        UserDashboardModel.getUserDashboardStats({
          currentDate,
          currentMonthStart,
          userId,
          startDate,
          endDate,
          timeRange
        }),
        UserDashboardModel.getUserLeadsVsClosedStats({
          currentMonthStart,
          currentDate,
          userId,
          startDate,
          endDate
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
        message: 'Error fetching user dashboard statistics',
        error: error.message
      });
    }
  },

  getUserReportStats: async (req, res) => {
    try {
      const userData = req.user;
      const userId = userData.id;
      const { startDate, endDate } = req.query;

      const stats = await UserDashboardModel.getUserReportStats({
        userId,
        startDate,
        endDate
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user report statistics',
        error: error.message
      });
    }
  }
};

export default UserDashboardController; 