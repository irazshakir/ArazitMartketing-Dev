import { supabase } from '../config/database.js';

export const ACTION_TYPES = {
    LEAD_CREATED: 'LEAD_CREATED',
    STATUS_CHANGE: 'STATUS_CHANGE',
    STAGE_CHANGE: 'STAGE_CHANGE',
    PRODUCT_CHANGE: 'PRODUCT_CHANGE',
    SOURCE_CHANGE: 'SOURCE_CHANGE',
    BRANCH_CHANGE: 'BRANCH_CHANGE',
    NAME_CHANGE: 'NAME_CHANGE',
    EMAIL_CHANGE: 'EMAIL_CHANGE',
    PHONE_CHANGE: 'PHONE_CHANGE',
    ASSIGNMENT_CHANGE: 'ASSIGNMENT_CHANGE',
    FOLLOWUP_UPDATE: 'FOLLOWUP_UPDATE',
    NOTE_ADDED: 'NOTE_ADDED'
  };

export const createLog = async ({
  leadId,
  userId,
  actionType,
  oldValue,
  newValue,
  description
}) => {
  try {
    const { data, error } = await supabase
      .from('lead_logs')
      .insert([{
        lead_id: leadId,
        user_id: userId,
        action_type: actionType,
        old_value: oldValue,
        new_value: newValue,
        description: description
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating log:', error);
    throw error;
  }
};

export const getLeadLogs = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('lead_logs')
      .select(`
        *,
        users!user_id (
          id,
          name
        ),
        stages (
          id,
          stage_name
        ),
        lead_notes (
          id,
          note
        )
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lead logs:', error);
    throw error;
  }
}; 