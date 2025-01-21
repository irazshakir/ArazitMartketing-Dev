import React, { useEffect, useState } from 'react';
import { Timeline, Card, Spin } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const LeadLogs = ({ leadId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [leadId]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('user_jwt');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('LeadLogs - Fetching logs for lead:', leadId);

      const response = await axios.get(`/api/user-leads/${leadId}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('LeadLogs - Logs fetched successfully:', response.data.data.length);
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('LeadLogs - Error fetching logs:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogDescription = (log) => {
    switch (log.action_type) {
      case 'STATUS_CHANGE':
        return `Status changed from ${log.old_value?.lead_active_status ? 'Active' : 'Inactive'} to ${log.new_value?.lead_active_status ? 'Active' : 'Inactive'}`;
      case 'STAGE_CHANGE':
        return `Stage changed from "${log.old_value?.stage_name || 'none'}" to "${log.new_value?.stage_name}"`;
      case 'PRODUCT_CHANGE':
        return `Product changed from "${log.old_value?.product_name || 'none'}" to "${log.new_value?.product_name}"`;
      case 'SOURCE_CHANGE':
        return `Lead source changed from "${log.old_value?.source_name || 'none'}" to "${log.new_value?.source_name}"`;
      case 'BRANCH_CHANGE':
        return `Branch changed from "${log.old_value?.branch_name || 'none'}" to "${log.new_value?.branch_name}"`;
      case 'NAME_CHANGE':
        return `Name updated from "${log.old_value?.name}" to "${log.new_value?.name}"`;
      case 'EMAIL_CHANGE':
        return `Email updated from "${log.old_value?.email || 'none'}" to "${log.new_value?.email || 'none'}"`;
      case 'PHONE_CHANGE':
        return `Phone updated from "${log.old_value?.phone || 'none'}" to "${log.new_value?.phone || 'none'}"`;
      case 'ASSIGNMENT_CHANGE':
        return `Lead assigned from "${log.old_value?.assigned_user_name || 'none'}" to "${log.new_value?.assigned_user_name}"`;
      case 'FOLLOWUP_UPDATE':
        return `Follow-up date updated from "${log.old_value?.fu_date || 'none'}" to "${log.new_value?.fu_date}"`;
      case 'NOTE_ADDED':
        return `Added note: "${log.new_value?.note}"`;
      case 'LEAD_CREATED':
        return 'Lead created';
      default:
        return log.description;
    }
  };

  return (
    <Card title="Lead Activity Log" bordered={false}>
      <Spin spinning={loading}>
        <Timeline mode="left">
          {logs.map((log) => (
            <Timeline.Item
              key={log.id}
              dot={<ClockCircleOutlined />}
              label={new Date(log.created_at).toLocaleString()}
            >
              <strong>{log.user_name}</strong>: {getLogDescription(log)}
            </Timeline.Item>
          ))}
        </Timeline>
      </Spin>
    </Card>
  );
};

export default LeadLogs; 