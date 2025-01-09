import express from 'express';
import { LeadModel, ProductModel, StageModel, LeadSourceModel, UserModel } from '../models/index.js';

const router = express.Router();

// Get all leads
router.get('/leads', async (req, res) => {
  try {
    const leads = await LeadModel.findAll({
      include: [
        { model: ProductModel, attributes: ['product_name'] },
        { model: StageModel, attributes: ['stage_name'] },
        { model: LeadSourceModel, attributes: ['lead_source_name'] },
        { model: UserModel, attributes: ['name'] }
      ]
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads', error });
  }
});

// Get active products
router.get('/products', async (req, res) => {
  try {
    const products = await ProductModel.findAll({ where: { is_active: true }});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get active stages
router.get('/stages', async (req, res) => {
  try {
    const stages = await StageModel.findAll({
      where: { is_active: true },
      attributes: ['id', 'stage_name']
    });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stages', error });
  }
});

// Get active lead sources
router.get('/lead-sources', async (req, res) => {
  try {
    const sources = await LeadSourceModel.findAll({
      where: { is_active: true },
      attributes: ['id', 'lead_source_name']
    });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead sources', error });
  }
});

// Get active users
router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.findAll({
      where: { is_active: true },
      attributes: ['id', 'name']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Create new lead
router.post('/leads', async (req, res) => {
  try {
    const lead = await LeadModel.create(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lead', error });
  }
});

// Update lead
router.patch('/leads/:id', async (req, res) => {
  try {
    const lead = await LeadModel.update(req.params.id, req.body);
    res.json(lead);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating lead', 
      error: error.message
    });
  }
});

// Delete lead
router.delete('/leads/:id', async (req, res) => {
  try {
    const lead = await LeadModel.findByPk(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lead', error });
  }
});

// Get single lead with related data
router.get('/leads/:id', async (req, res) => {
  try {
    const lead = await LeadModel.findOne(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead details', error });
  }
});

// Add new route for lead assignment
router.patch('/leads/assign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_user } = req.body;

    const lead = await LeadModel.update(id, {
      assigned_user,
      updated_at: new Date().toISOString()
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error assigning lead', 
      error: error.message 
    });
  }
});

export default router; 