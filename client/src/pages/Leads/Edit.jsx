import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, Spin, Select } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatInfo from '../../components/ChatInfo/ChatInfo';
import axios from 'axios';

const { Content, Sider } = Layout;
const { Title } = Typography;

const LeadEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedUser, setAssignedUser] = useState(lead?.assigned_user || null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.get(`/api/leads/${id}`);
        setLead(response.data);
      } catch (error) {
        message.error('Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        message.error('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const handleSendMessage = (message) => {
    // Handle WhatsApp message sending
    console.log('Sending message:', message);
  };

  const handleAddNote = (note) => {
    // Handle internal note adding
    console.log('Adding note:', note);
  };

  const handleAddTag = () => {
    // Implement tag adding logic here
  };

  const handleLinkCompany = () => {
    // Implement company linking logic here
  };

  const handleAssigneeChange = async (userId) => {
    try {
      await axios.patch(`/api/leads/${id}/assign`, { assigned_user: userId });
      setAssignedUser(userId);
      message.success('Lead assigned successfully');
    } catch (error) {
      message.error('Failed to assign lead');
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
    <Layout style={{ height: '100vh' }}>
      <div style={{ 
        padding: '16px 24px', 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        />
        <Title level={4} style={{ margin: 0, flex: 1 }}>
          Lead Details
        </Title>
        
        <Select
          placeholder="Assign to user"
          onChange={handleAssigneeChange}
          value={assignedUser}
          style={{ 
            width: 200,
            marginLeft: 'auto'
          }}
          loading={loading}
          suffixIcon={<UserOutlined />}
        >
          {users.map(user => (
            <Select.Option key={user.id} value={user.id}>
              {user.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Layout style={{ background: '#fff', height: 'calc(100vh - 65px)' }}>
        <Content style={{ 
          height: '100%',
          overflow: 'hidden'
        }}>
          <ChatBox 
            onSendMessage={handleSendMessage}
            onAddNote={handleAddNote}
            currentAssignee={assignedUser}
            onAssigneeChange={handleAssigneeChange}
          />
        </Content>
        
        <Sider 
          width={350} 
          style={{ 
            background: '#fff',
            borderLeft: '1px solid #f0f0f0',
            overflow: 'auto'
          }}
        >
          <ChatInfo
            contact={{
              name: lead?.name,
              phone: lead?.phone,
              email: lead?.email,
              whatsapp: true,
              marketingOptIn: 'Yes',
              source: lead?.lead_sources?.lead_source_name,
              sourceId: lead?.id,
              // Add other relevant lead data here
            }}
            onAddTag={handleAddTag}
            onLinkCompany={handleLinkCompany}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default LeadEdit;
