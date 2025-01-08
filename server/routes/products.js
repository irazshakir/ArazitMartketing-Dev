import express from 'express';
import { ProductModel } from '../models/index.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    console.log('Fetching products...'); // Debug log
    const products = await ProductModel.findAll({ where: { is_active: true }});
    console.log('Products fetched:', products); // Debug log
    res.json(products);
  } catch (error) {
    console.error('Error in /products route:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

export default router; 