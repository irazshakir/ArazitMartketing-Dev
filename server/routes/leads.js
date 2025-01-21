import express from 'express';
import { LeadModel, ProductModel, StageModel, LeadSourceModel, UserModel, BranchModel } from '../models/index.js';
import { supabase } from '../config/database.js';
import { createLog, ACTION_TYPES } from '../services/leadLogService.js';


const router = express.Router();

// Get all leads
router.get('/leads', async (req, res) => {
  try {
    const { search, lead_product, lead_stage, assigned_user, lead_active_status } = req.query;
    
    let query = supabase
      .from('leads')
      .select(`
        *,
        products!lead_product(product_name),
        stages!lead_stage(stage_name),
        lead_sources!lead_source_id(lead_source_name),
        users!assigned_user(name),
        company_branches!leads_branch_id_fkey(branch_name)
      `);

    // Apply filters if they exist
    if (lead_product) {
      query = query.eq('lead_product', lead_product);
    }
    if (lead_stage) {
      query = query.eq('lead_stage', lead_stage);
    }
    if (assigned_user) {
      query = query.eq('assigned_user', assigned_user);
    }
    if (lead_active_status !== null && lead_active_status !== undefined) {
      query = query.eq('lead_active_status', lead_active_status === 'true');
    }
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
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
    const { id } = req.params;
    const lead = await LeadModel.update(id, req.body);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
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

// Add new route for lead assignment
router.patch('/leads/assign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_user } = req.body;

    const lead = await LeadModel.update(id, {
      assigned_user: assigned_user
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

// GET lead notes
router.get('/leads/:id/notes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lead_notes')
      .select(`
        *,
        users!note_added_by (
          id,
          name
        )
      `)
      .eq('lead_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [] // Ensure we always return an array
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching notes',
      details: error.message 
    });
  }
});

// POST new note
router.post('/leads/:id/notes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lead_notes')
      .insert([{
        lead_id: req.params.id,
        note: req.body.note,
        note_added_by: req.body.note_added_by
      }])
      .select(`
        *,
        users!note_added_by (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error creating note',
      details: error.message 
    });
  }
});

// Add this with other GET routes
router.get('/branches', async (req, res) => {
  try {
    const branches = await BranchModel.findAll({
      where: { branch_is_active: true }
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error });
  }
});

export default router; 