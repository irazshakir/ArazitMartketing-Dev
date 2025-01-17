import express from 'express';
import ReportsController from '../controllers/ReportsController.js';
import { ReportsModel } from '../models/index.js';

const router = express.Router();

router.get('/stats', ReportsController.getReportsStats);

router.get('/user-stats', async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0];

    const stats = await ReportsModel.getUserWiseLeadStats({
      currentMonthStart,
      currentDate,
      branchId,
      startDate,
      endDate
    });

    res.json(stats);
  } catch (error) {
    console.error('Error in user stats route:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0];

    const trendData = await ReportsModel.getLeadsTrend({
      currentMonthStart,
      currentDate,
      branchId,
      startDate,
      endDate
    });

    res.json(trendData);
  } catch (error) {
    console.error('Error in trends route:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

export default router; 