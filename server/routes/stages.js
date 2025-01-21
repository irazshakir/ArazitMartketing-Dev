import express from 'express';
import { StageModel } from '../models/index.js';

const router = express.Router();

router.get('/stages', async (req, res) => {
  try {
    const stages = await StageModel.findAll({ where: { is_active: true }});
    res.json(stages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching stages',
      error: error.message 
    });
  }
});

export default router; 