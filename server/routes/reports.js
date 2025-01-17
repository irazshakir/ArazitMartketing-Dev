import express from 'express';
import ReportsController from '../controllers/ReportsController.js';

const router = express.Router();

router.get('/stats', ReportsController.getReportsStats);

export default router; 