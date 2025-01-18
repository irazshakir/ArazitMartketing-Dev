import { supabase } from '../config/database.js';

const UserLeadsController = {
  getUserLeads: async (req, res) => {
    try {
      const userId = req.user.id;
      const { searchQuery } = req.query;

      let query = supabase
        .from('leads')
        .select(`
          *,
          products!lead_product (
            id,
            product_name
          ),
          stages!lead_stage (
            id,
            stage_name
          ),
          lead_sources!lead_source_id (
            id,
            lead_source_name
          ),
          company_branches!branch_id (
            id,
            branch_name
          )
        `)
        .eq('assigned_user', userId)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          phone.ilike.%${searchQuery}%,
          email.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Ensure we always return an array and transform lead_active_status
      const leads = Array.isArray(data) ? data.map(lead => ({
        ...lead,
        lead_active_status: Boolean(lead.lead_active_status) // Ensure boolean value
      })) : [];

      res.json({
        success: true,
        data: leads
      });
    } catch (error) {
      console.error('Error in getUserLeads:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch leads',
        details: error.message 
      });
    }
  },

  getUserLead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          products!lead_product (
            id,
            product_name
          ),
          stages!lead_stage (
            id,
            stage_name
          ),
          lead_sources!lead_source_id (
            id,
            lead_source_name
          ),
          company_branches!branch_id (
            id,
            branch_name
          )
        `)
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getUserLead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lead details',
        details: error.message
      });
    }
  },

  addLeadNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const userId = req.user.id;

      console.log('UserLeadsController - Adding note:', {
        leadId: id,
        userId,
        note
      });

      // Verify the lead belongs to the user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      console.log('UserLeadsController - Lead verification:', {
        leadData,
        error: leadError?.message
      });

      if (leadError || !leadData) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to add notes to this lead'
        });
      }

      // Add the note with user information
      const { data, error } = await supabase
        .from('lead_notes')
        .insert([{
          lead_id: id,
          note,
          note_added_by: userId
        }])
        .select(`
          *,
          users!note_added_by (
            id,
            name
          )
        `)
        .single();

      console.log('UserLeadsController - Note creation:', {
        data,
        error: error?.message
      });

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('UserLeadsController - Error in addLeadNote:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Failed to add note',
        details: error.message
      });
    }
  },

  updateLead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Verify the lead belongs to the user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to update this lead'
        });
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in updateLead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update lead',
        details: error.message
      });
    }
  },

  getUserLeadNotes: async (req, res) => {
    try {
      console.log('UserLeadsController - Getting notes:', {
        leadId: req.params.id,
        userId: req.user?.id,
        userRole: req.user?.roles?.role_name
      });

      const { id } = req.params;
      const userId = req.user.id;

      // Verify lead ownership
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      console.log('UserLeadsController - Lead verification:', {
        leadData,
        error: leadError?.message
      });

      if (leadError || !leadData) {
        console.log('UserLeadsController - Unauthorized access attempt');
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to view notes for this lead'
        });
      }

      // Get notes
      const { data: notes, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          users!note_added_by (
            id,
            name
          )
        `)
        .eq('lead_id', id)
        .order('created_at', { ascending: false });

      console.log('UserLeadsController - Notes query result:', {
        notesCount: notes?.length,
        error: error?.message
      });

      if (error) throw error;

      // Ensure we're returning an array in the data property
      res.json({
        success: true,
        data: notes || [] // Ensure we always return an array
      });
    } catch (error) {
      console.error('UserLeadsController - Error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notes',
        details: error.message
      });
    }
  },

  addUserLeadNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const userId = req.user.id;

      console.log('UserLeadsController - Adding note request:', {
        leadId: id,
        userId: userId,
        note: note,
        body: req.body,
        user: req.user
      });

      // Verify if the lead belongs to the user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      console.log('UserLeadsController - Lead verification:', {
        leadData,
        error: leadError?.message,
        userId,
        leadId: id
      });

      if (leadError || !leadData) {
        console.log('UserLeadsController - Unauthorized attempt:', {
          userId,
          leadId: id,
          error: leadError?.message
        });
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to add notes to this lead'
        });
      }

      // Add the note
      const { data, error } = await supabase
        .from('lead_notes')
        .insert([{
          lead_id: id,
          note,
          note_added_by: userId
        }])
        .select(`
          *,
          users!note_added_by (
            id,
            name
          )
        `)
        .single();

      console.log('UserLeadsController - Note creation result:', {
        success: !error,
        data: data,
        error: error?.message
      });

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('UserLeadsController - Error in addUserLeadNote:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Failed to add note',
        details: error.message
      });
    }
  }
};

export default UserLeadsController; 