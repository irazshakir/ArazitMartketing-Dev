import express from 'express';
import DashboardController from '../controllers/DashboardController.js';

const router = express.Router();

router.get('/stats', DashboardController.getDashboardStats);
router.get('/branches', DashboardController.getBranches);

export default router; 