import express from 'express';
import { AccountModel } from '../models/index.js';

const router = express.Router();

// Create new transaction
router.post('/accounts', async (req, res) => {
  try {
    const account = await AccountModel.create(req.body);
    res.status(201).json({
      message: 'Transaction created successfully',
      data: account
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating transaction', 
      error: error.message 
    });
  }
});

// Get all transactions with stats
router.get('/accounts', async (req, res) => {
  try {
    const { search, timeRange, startDate, endDate, type } = req.query;
    
    const [transactions, stats] = await Promise.all([
      AccountModel.findAll({ search, timeRange, startDate, endDate, type }),
      AccountModel.getStats(timeRange)
    ]);
    
    res.json({
      transactions,
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
});

// Update transaction
router.put('/accounts/:id', async (req, res) => {
  try {
    const account = await AccountModel.update(req.params.id, req.body);
    res.json({
      message: 'Transaction updated successfully',
      data: account
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating transaction', 
      error: error.message 
    });
  }
});

// Delete transaction
router.delete('/accounts/:id', async (req, res) => {
  try {
    await AccountModel.delete(req.params.id);
    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting transaction', 
      error: error.message 
    });
  }
});

export default router; 