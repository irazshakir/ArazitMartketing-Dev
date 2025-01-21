import { supabase } from '../config/database.js';
import { createLog, getLeadLogs, ACTION_TYPES } from '../services/leadLogService.js';

const UserLeadsController = {
  getUserLeads: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        search,
        lead_product,
        lead_stage,
        lead_active_status,
        lead_source_id,
        fu_date
      } = req.query;

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
        .eq('assigned_user', userId);

      // Apply search if it exists (searching across name, phone, and email)
      if (search && typeof search === 'string' && search.trim()) {
        const sanitizedSearch = search.trim().replace(/[%_]/g, '\\$&'); // Escape special characters
        query = query.or(
          `name.ilike.%${sanitizedSearch}%,` +
          `phone.ilike.%${sanitizedSearch}%,` +
          `email.ilike.%${sanitizedSearch}%`
        );
      }

      // Apply other filters if they exist
      if (lead_product) {
        query = query.eq('lead_product', lead_product);
      }
      if (lead_stage) {
        query = query.eq('lead_stage', lead_stage);
      }
      if (lead_active_status !== undefined) {
        query = query.eq('lead_active_status', lead_active_status === 'true');
      }
      if (lead_source_id) {
        query = query.eq('lead_source_id', lead_source_id);
      }
      if (fu_date) {
        query = query.eq('fu_date', fu_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Sort the leads:
      // 1. Active leads first
      // 2. For active leads, sort by followup date (past dates first)
      const sortedLeads = data.sort((a, b) => {
        // First, sort by active status
        if (a.lead_active_status !== b.lead_active_status) {
          return a.lead_active_status ? -1 : 1;
        }

        // For leads with same active status, sort by followup date
        const dateA = new Date(a.fu_date || '9999-12-31');
        const dateB = new Date(b.fu_date || '9999-12-31');

        if (a.lead_active_status === true) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const aIsPast = dateA < today;
          const bIsPast = dateB < today;

          if (aIsPast !== bIsPast) {
            return aIsPast ? -1 : 1;
          }
        }

        return dateA - dateB;
      });

      const transformedLeads = sortedLeads.map(lead => ({
        ...lead,
        lead_active_status: Boolean(lead.lead_active_status)
      }));

      res.json({
        success: true,
        data: transformedLeads
      });
    } catch (error) {
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

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
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

      // Get current lead data for comparison
      const { data: currentLead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Verify the lead belongs to the user
      if (currentLead.assigned_user !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to update this lead'
        });
      }

      // Create logs for each changed field
      const logPromises = [];

      // Check each field and create appropriate logs
      if (updateData.name !== currentLead.name) {
        logPromises.push(createLog({
          leadId: id,
          userId,
          actionType: ACTION_TYPES.NAME_CHANGE,
          oldValue: { name: currentLead.name },
          newValue: { name: updateData.name },
          description: `Name changed from "${currentLead.name}" to "${updateData.name}"`
        }));
      }

      if (updateData.email !== currentLead.email) {
        logPromises.push(createLog({
          leadId: id,
          userId,
          actionType: ACTION_TYPES.EMAIL_CHANGE,
          oldValue: { email: currentLead.email },
          newValue: { email: updateData.email },
          description: `Email changed from "${currentLead.email || 'none'}" to "${updateData.email || 'none'}"`
        }));
      }

      if (updateData.phone !== currentLead.phone) {
        logPromises.push(createLog({
          leadId: id,
          userId,
          actionType: ACTION_TYPES.PHONE_CHANGE,
          oldValue: { phone: currentLead.phone },
          newValue: { phone: updateData.phone },
          description: `Phone changed from "${currentLead.phone || 'none'}" to "${updateData.phone || 'none'}"`
        }));
      }

      if (updateData.lead_stage !== currentLead.lead_stage) {
        const { data: stages } = await supabase
          .from('stages')
          .select('stage_name')
          .in('id', [currentLead.lead_stage, updateData.lead_stage]);
        
        const oldStage = stages.find(s => s.id === currentLead.lead_stage)?.stage_name;
        const newStage = stages.find(s => s.id === updateData.lead_stage)?.stage_name;
        
        logPromises.push(createLog({
          leadId: id,
          userId,
          actionType: ACTION_TYPES.STAGE_CHANGE,
          oldValue: { lead_stage: currentLead.lead_stage, stage_name: oldStage },
          newValue: { lead_stage: updateData.lead_stage, stage_name: newStage },
          description: `Stage changed from "${oldStage}" to "${newStage}"`
        }));
      }

      // Similar checks for other fields...
      if (updateData.lead_product !== currentLead.lead_product) {
        // Log product change
      }
      if (updateData.lead_source_id !== currentLead.lead_source_id) {
        // Log source change
      }
      if (updateData.branch_id !== currentLead.branch_id) {
        // Log branch change
      }
      if (updateData.lead_active_status !== currentLead.lead_active_status) {
        // Log status change
      }
      if (updateData.fu_date !== currentLead.fu_date) {
        // Log followup date change
      }

      // Update the lead
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Create all logs
      if (logPromises.length > 0) {
        await Promise.all(logPromises);
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update lead',
        details: error.message
      });
    }
  },

  getUserLeadNotes: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify lead ownership
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
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

      if (error) throw error;

      // Ensure we're returning an array in the data property
      res.json({
        success: true,
        data: notes || [] // Ensure we always return an array
      });
    } catch (error) {
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

      // Verify if the lead belongs to the user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
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

      if (error) throw error;

      // Create log entry for note
      await createLog({
        leadId: id,
        userId,
        actionType: ACTION_TYPES.NOTE_ADDED,
        newValue: { note, note_id: data.id },
        description: `New note added`
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
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

      // First check if we have valid user ID
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'No user ID provided'
        });
      }

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

      } catch (dbError) {
        throw dbError;
      }

      const { data: userData, error } = queryResponse;

      if (error) {
        throw error;
      }

      if (!userData || userData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      const user = Array.isArray(userData) ? userData[0] : userData;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
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

      // Verify if the lead belongs to the current user
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id, assigned_user')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
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

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to assign lead',
        details: error.message
      });
    }
  },

  getUsers: async (req, res) => {
    try {
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

      if (error) throw error;

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        details: error.message
      });
    }
  },

  getGeneralSettings: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch general settings',
        details: error.message
      });
    }
  },

  getLeadLogs: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .eq('assigned_user', userId)
        .single();

      if (leadError || !leadData) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to view this lead\'s logs'
        });
      }

      const logs = await getLeadLogs(id);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lead logs',
        details: error.message
      });
    }
  }
};

export default UserLeadsController; 