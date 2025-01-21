import express from 'express';
import { LeadSourceModel } from '../models/index.js';

const router = express.Router();

router.get('/lead-sources', async (req, res) => {
  try {
    const sources = await LeadSourceModel.findAll({ where: { is_active: true }});
    res.json(sources);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching lead sources',
      error: error.message 
    });
  }
});

export default router; 