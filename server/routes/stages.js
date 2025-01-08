import express from 'express';
import { StageModel } from '../models/index.js';

const router = express.Router();

router.get('/stages', async (req, res) => {
  try {
    console.log('Fetching stages...'); // Debug log
    const stages = await StageModel.findAll({ where: { is_active: true }});
    console.log('Stages fetched:', stages); // Debug log
    res.json(stages);
  } catch (error) {
    console.error('Error in /stages route:', error);
    res.status(500).json({ 
      message: 'Error fetching stages',
      error: error.message 
    });
  }
});

export default router; 