import express from 'express';
import { LeadSourceModel } from '../models/index.js';

const router = express.Router();

router.get('/lead-sources', async (req, res) => {
  try {
    console.log('Fetching lead sources...'); // Debug log
    const sources = await LeadSourceModel.findAll({ where: { is_active: true }});
    console.log('Lead sources fetched:', sources); // Debug log
    res.json(sources);
  } catch (error) {
    console.error('Error in /lead-sources route:', error);
    res.status(500).json({ 
      message: 'Error fetching lead sources',
      error: error.message 
    });
  }
});

export default router; 