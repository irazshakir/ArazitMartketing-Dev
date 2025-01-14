import express from 'express';
import { BranchModel } from '../models/index.js';

const router = express.Router();

// Get all branches
router.get('/branches', async (req, res) => {
  try {
    const branches = await BranchModel.findAll();
    res.json(branches);
  } catch (error) {
    console.error('Error in GET /branches:', error);
    res.status(500).json({ 
      message: 'Error fetching branches',
      error: error.message 
    });
  }
});

// Create new branch
router.post('/branches', async (req, res) => {
  try {
    const branch = await BranchModel.create(req.body);
    res.status(201).json(branch);
  } catch (error) {
    console.error('Error in POST /branches:', error);
    res.status(500).json({ 
      message: 'Error creating branch',
      error: error.message 
    });
  }
});

// Update branch
router.put('/branches/:id', async (req, res) => {
  try {
    const branch = await BranchModel.update(req.params.id, req.body);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    console.error('Error in PUT /branches/:id:', error);
    res.status(500).json({ 
      message: 'Error updating branch',
      error: error.message 
    });
  }
});

// Delete branch
router.delete('/branches/:id', async (req, res) => {
  try {
    await BranchModel.destroy(req.params.id);
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /branches/:id:', error);
    res.status(500).json({ 
      message: 'Error deleting branch',
      error: error.message 
    });
  }
});

export default router; 