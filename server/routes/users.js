import express from 'express';
import { UserModel } from '../models/index.js';

const router = express.Router();

// Get active users
router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.findAll({
      where: { is_active: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get inactive users
router.get('/users/inactive', async (req, res) => {
  try {
    const users = await UserModel.findAll({
      where: { is_active: false }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    res.status(500).json({ message: 'Error fetching inactive users' });
  }
});

export default router; 