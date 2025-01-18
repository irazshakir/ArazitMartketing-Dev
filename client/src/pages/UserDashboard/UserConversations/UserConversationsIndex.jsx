import React, { useState, useEffect } from 'react';
import { Layout, Typography, message, Spin, Select, Avatar } from 'antd';
import { WhatsAppOutlined, UserOutlined } from '@ant-design/icons';
import ChatList from '../../../components/ChatList/ChatList';
import ChatBox from '../../../components/ChatBox/ChatBox';
import ChatInfo from '../../../components/ChatInfo/ChatInfo';
import styles from './UserConversations.module.css';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { Content, Sider } = Layout;

const UserConversationsIndex = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch active leads assigned to current user
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await axios.get('/api/user-leads', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Transform leads data to match ChatList format
        const formattedLeads = response.data.data.map(lead => ({
          id: lead.id,
          name: lead.name,
          time: lead.created_at,
          lastMessage: lead.last_message || 'No messages yet',
          assigned_user_name: lead.users?.name,
          assigned_user: lead.assigned_user,
          avatarColor: '#ff4d4f',
          whatsapp: true,
          phone: lead.phone
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

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        if (!token) {
          console.error('No token found');
          message.error('Please login again');
          return;
        }

        const response = await axios.get('/api/user-leads/current-user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setCurrentUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        message.error('Failed to get current user');
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChatSelect = async (chat) => {
    try {
      const token = localStorage.getItem('user_jwt');
      const response = await axios.get(`/api/user-leads/${chat.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSelectedChat({
        ...chat,
        ...response.data.data
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

      const token = localStorage.getItem('user_jwt');
      const response = await axios.post('/api/webhook/reply', {
        phone: selectedChat.phone,
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
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

      const token = localStorage.getItem('user_jwt');
      const response = await axios.post(`/api/user-leads/${selectedChat.id}/notes`, {
        note,
        lead_id: selectedChat.id,
        note_added_by: currentUser.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        message.success('Note added successfully');
      }
    } catch (error) {
      message.error('Failed to add note');
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
    <Layout className={styles.conversationsLayout}>
      <Sider width={350} className={styles.chatListSider}>
        <ChatList 
          chats={leads}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
        />
      </Sider>

      <Content className={styles.chatBoxSection}>
        {selectedChat ? (
          <ChatBox
            onSendMessage={handleSendMessage}
            onAddNote={handleAddNote}
            currentAssignee={selectedChat.assigned_user}
            id={selectedChat?.id}
            phone={selectedChat?.phone}
          />
        ) : (
          <div className={styles.noChatSelected}>
            <Typography.Text type="secondary">
              Select a conversation to start messaging
            </Typography.Text>
          </div>
        )}
      </Content>

      <Sider width={350} className={styles.chatInfoSider}>
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
              branch_id: selectedChat.branch_id,
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

export default UserConversationsIndex; 