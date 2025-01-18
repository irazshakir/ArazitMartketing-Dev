import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, Spin, Select } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import ChatBox from '../../../components/ChatBox/ChatBox';
import ChatInfo from '../../../components/ChatInfo/ChatInfo';
import axios from 'axios';

const { Content, Sider } = Layout;
const { Title } = Typography;

const UserLeadEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedUser, setAssignedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await axios.get(`/api/user-leads/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setLead(response.data.data);
        setAssignedUser(response.data.data?.assigned_user);
      } catch (error) {
        message.error('Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await axios.get('/api/current-user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 'success') {
          setCurrentUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        message.error('Failed to get current user');
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSendMessage = (message) => {
    // Handle WhatsApp message sending
  };

  const handleAddNote = async (note) => {
    try {
      if (!currentUser) {
        console.log('UserLeadEdit - No current user found');
        message.warning('Please login to add notes');
        return;
      }

      console.log('UserLeadEdit - Adding note:', {
        leadId: id,
        userId: currentUser.user_id,
        note: note
      });

      const token = localStorage.getItem('user_jwt');
      const response = await axios.post(`/api/user-leads/${id}/notes`, {
        note,
        lead_id: id,
        note_added_by: currentUser.user_id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('UserLeadEdit - Note response:', response.data);
      
      if (response.data.success) {
        message.success('Note added successfully');
      }
    } catch (error) {
      console.error('UserLeadEdit - Error adding note:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh', minHeight: '100vh', margin: 0 }}>
      <div style={{ 
        padding: '8px 16px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/user/leads')}
        />
        <Title level={4} style={{ margin: 0, flex: 1 }}>
          Lead Details
        </Title>
      </div>

      <Layout style={{ 
        background: '#fff', 
        height: 'calc(100vh - 57px)',
        margin: 0
      }}>
        <Content style={{ 
          height: '100%',
          overflow: 'hidden',
          padding: 0,
          margin: 0
        }}>
          <ChatBox 
            onSendMessage={handleSendMessage}
            onAddNote={handleAddNote}
            currentAssignee={assignedUser}
            id={id}
            phone={lead?.phone}
          />
        </Content>
        
        <Sider 
          width={350} 
          style={{ 
            background: '#fff',
            borderLeft: '1px solid #f0f0f0',
            overflow: 'auto',
            padding: 0,
            margin: 0
          }}
        >
          <ChatInfo
            contact={{
              id: lead?.id,
              name: lead?.name,
              phone: lead?.phone,
              email: lead?.email,
              whatsapp: true,
              lead_product: lead?.lead_product,
              lead_stage: lead?.lead_stage,
              lead_source_id: lead?.lead_source_id,
              branch_id: lead?.branch_id,
              fu_date: lead?.fu_date,
              fu_hour: lead?.fu_hour,
              fu_minutes: lead?.fu_minutes,
              fu_period: lead?.fu_period,
              lead_active_status: lead?.lead_active_status
            }}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default UserLeadEdit; 