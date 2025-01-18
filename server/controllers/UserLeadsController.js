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
  },

  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.id;

      console.log('UserLeadsController - Getting current user - Initial data:', {
        userId,
        reqUser: req.user,
        headers: req.headers
      });

      // First check if we have valid user ID
      if (!userId) {
        console.error('UserLeadsController - No user ID provided');
        return res.status(400).json({
          success: false,
          error: 'No user ID provided'
        });
      }

      console.log('UserLeadsController - Executing Supabase query for user:', userId);

      // Updated query with error catching
      let queryResponse;
      try {
        queryResponse = await supabase
          .from('users')
          .select(`
            id,
            name,
            role_id,
            user_is_active,
            roles:role_id (
              id,
              role_name
            )
          `)
          .eq('id', userId)
          .eq('user_is_active', true);

        console.log('UserLeadsController - Raw Supabase response:', {
          data: queryResponse.data,
          error: queryResponse.error,
          status: queryResponse.status,
          statusText: queryResponse.statusText
        });

      } catch (dbError) {
        console.error('UserLeadsController - Database query error:', {
          error: dbError.message,
          stack: dbError.stack,
          details: dbError.details
        });
        throw dbError;
      }

      const { data: userData, error } = queryResponse;

      if (error) {
        console.error('UserLeadsController - Database error details:', {
          message: error.message,
          hint: error.hint,
          details: error.details,
          code: error.code
        });
        throw error;
      }

      if (!userData || userData.length === 0) {
        console.log('UserLeadsController - No user found or user inactive:', {
          userId,
          queryResult: userData
        });
        return res.status(404).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      const user = Array.isArray(userData) ? userData[0] : userData;

      console.log('UserLeadsController - User data fetched successfully:', {
        userId: user.id,
        name: user.name,
        roleId: user.role_id,
        isActive: user.user_is_active,
        role: user.roles?.role_name,
        fullData: user
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('UserLeadsController - Critical error in getCurrentUser:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
        details: error.details || 'No additional details'
      });

      // Check if it's a database connection error
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          error: 'Database connection failed',
          details: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get current user',
        details: error.message
      });
    }
  },

  assignLead: async (req, res) => {
    try {
      const { id } = req.params;
      const { assigned_user } = req.body;
      const userId = req.user.id;

      console.log('UserLeadsController - Assigning lead:', {
        leadId: id,
        assignedTo: assigned_user,
        requestedBy: userId
      });

      // Verify if the lead belongs to the current user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id, assigned_user')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
        console.log('UserLeadsController - Unauthorized lead assignment attempt');
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to assign this lead'
        });
      }

      // Update the lead's assigned user
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_user })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('UserLeadsController - Lead assigned successfully:', {
        leadId: id,
        newAssignee: assigned_user
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('UserLeadsController - Error assigning lead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign lead',
        details: error.message
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      console.log('UserLeadsController - Fetching users');

      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          role_id,
          user_is_active
        `)
        .eq('user_is_active', true)
        .order('name');

      if (error) {
        console.error('UserLeadsController - Error fetching users:', error);
        throw error;
      }

      console.log('UserLeadsController - Users fetched:', users.length);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('UserLeadsController - Error in getUsers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        details: error.message
      });
    }
  }
};

export default UserLeadsController; 