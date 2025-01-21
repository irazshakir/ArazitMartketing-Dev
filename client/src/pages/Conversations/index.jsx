import React, { useState, useEffect } from 'react';
import { Layout, Typography, message, Spin, Select, Avatar } from 'antd';
import { WhatsAppOutlined, UserOutlined } from '@ant-design/icons';
import ChatList from '../../components/ChatList/ChatList';
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatInfo from '../../components/ChatInfo/ChatInfo';
import styles from './Conversations.module.css';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content, Sider } = Layout;

const Conversations = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch active leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get('/api/leads', {
          params: {
            active: true // This will be handled in the backend to filter active leads
          }
        });
        
        // Transform leads data to match ChatList format
        const formattedLeads = response.data.map(lead => ({
          id: lead.id,
          name: lead.name,
          time: lead.created_at,
          lastMessage: lead.last_message || 'No messages yet',
          assigned_user_name: lead.users?.name,
          assigned_user: lead.assigned_user,
          avatarColor: '#ff4d4f',
          whatsapp: true
        }));

        setLeads(formattedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        message.error('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Fetch current user (reusing from Edit.jsx)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          message.error('Please login again');
          return;
        }

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

  // Add users fetch effect from Edit.jsx
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

  const handleChatSelect = async (chat) => {
    try {
      // Fetch detailed lead information when selected
      const response = await axios.get(`/api/leads/${chat.id}`);
      setSelectedChat({
        ...chat,
        ...response.data // Merge the detailed lead data
      });
    } catch (error) {
      console.error('Error fetching lead details:', error);
      message.error('Failed to fetch lead details');
    }
  };

  const handleSendMessage = async (message) => {
    try {
      if (!selectedChat?.phone) {
        message.error('No recipient phone number found');
        return;
      }

      // Send WhatsApp message
      const response = await axios.post('/api/webhook/reply', {
        recipient: selectedChat.phone,
        text: message,
        leadId: selectedChat.id  // Add leadId for message storage
      });

      if (response.data.success) {
        // Update local state if needed
        console.log('✅ Message sent successfully');
      } else {
        console.error('Failed to send message:', response.data.error);
        message.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    }
  };

  const handleAddNote = async (note) => {
    try {
      if (!currentUser) {
        message.warning('Please login to add notes');
        return;
      }

      const response = await axios.post(`/api/leads/${selectedChat.id}/notes`, {
        note,
        lead_id: selectedChat.id,
        note_added_by: currentUser.user_id,
        is_note: true
      });
      
      if (response.data) {
        message.success('Note added successfully');
      }
    } catch (error) {
      message.error('Failed to add note');
    }
  };

  // Add handleAssigneeChange method from Edit.jsx
  const handleAssigneeChange = async (userId) => {
    try {
      const response = await axios.patch(`/api/leads/assign/${selectedChat.id}`, { 
        assigned_user: userId
      });
      
      if (response.data) {
        setSelectedChat(prev => ({
          ...prev,
          assigned_user: userId
        }));
        message.success('Lead assigned successfully');
      }
    } catch (error) {
      message.error('Failed to assign lead');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className={styles.conversationsLayout} style={{ margin: 0, padding: 0 }}>
      <Sider 
        width={350} 
        className={styles.chatListSider}
        style={{ 
          height: '100vh', 
          overflow: 'auto',
          margin: 0,
          padding: 0,
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <ChatList 
          chats={leads}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
        />
      </Sider>

      <Content style={{ margin: 0, padding: 0 }}>
        {selectedChat ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.clientInfo}>
                <Avatar size={32}>{selectedChat.name?.[0]}</Avatar>
                <div className={styles.clientName}>
                  <Text strong>{selectedChat.name}</Text>
                  <WhatsAppOutlined className={styles.whatsappIcon} />
                </div>
              </div>
              <Select
                placeholder="Assign to"
                value={selectedChat.assigned_user}
                onChange={handleAssigneeChange}
                style={{ width: 200 }}
                suffixIcon={<UserOutlined />}
              >
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </div>
            <ChatBox
              onSendMessage={handleSendMessage}
              onAddNote={handleAddNote}
              currentAssignee={selectedChat.assigned_user}
              id={selectedChat?.id}
              phone={selectedChat?.phone} 
            />
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <Typography.Text type="secondary">
              Select a conversation to start messaging
            </Typography.Text>
          </div>
        )}
      </Content>

      <Sider 
        width={350} 
        className={styles.chatInfoSider}
        style={{ height: '100vh', overflow: 'auto' }}
      >
        {selectedChat && (
          <ChatInfo
            contact={{
              id: selectedChat.id,
              name: selectedChat.name,
              phone: selectedChat.phone,
              email: selectedChat.email,
              whatsapp: true,
              lead_product: selectedChat.lead_product,
              lead_stage: selectedChat.lead_stage,
              lead_source_id: selectedChat.lead_source_id,
              fu_date: selectedChat.fu_date,
              fu_hour: selectedChat.fu_hour,
              fu_minutes: selectedChat.fu_minutes,
              fu_period: selectedChat.fu_period,
              lead_active_status: selectedChat.lead_active_status
            }}
          />
        )}
      </Sider>
    </Layout>
  );
};

export default Conversations; 