import express from 'express';
import { UserModel } from '../models/index.js';

const router = express.Router();

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

export default router; 