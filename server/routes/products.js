import express from 'express';
import { ProductModel } from '../models/index.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const products = await ProductModel.findAll({ where: { is_active: true }});
    res.json(products);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

export default router; 