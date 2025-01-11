import React, { useState, useEffect } from 'react';
import { Layout, Typography, message, Spin } from 'antd';
import ChatList from '../../components/ChatList/ChatList';
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatInfo from '../../components/ChatInfo/ChatInfo';
import styles from './Conversations.module.css';
import axios from 'axios';

const { Title } = Typography;

const Conversations = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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
          time: lead.created_at, // Or last_updated if available
          lastMessage: lead.last_message || 'No messages yet',
          agent: lead.assigned_user_name,
          avatarColor: '#f56a00', // You can generate random colors or use a mapping
          whatsapp: true, // If you have this info in lead data
          copied: lead.is_copied // If you have this info in lead data
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
    // Reuse from Edit.jsx
    console.log('Sending message:', message);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className={styles.conversationsLayout}>
      <div className={styles.chatListContainer}>
        <Title level={4}>Conversations</Title>
        <ChatList 
          chats={leads}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
        />
      </div>

      <div className={styles.chatBoxContainer}>
        {selectedChat ? (
          <ChatBox
            onSendMessage={handleSendMessage}
            onAddNote={handleAddNote}
            currentAssignee={selectedChat.assigned_user}
            id={selectedChat.id}
          />
        ) : (
          <div className={styles.noChatSelected}>
            <Typography.Text type="secondary">
              Select a conversation to start messaging
            </Typography.Text>
          </div>
        )}
      </div>

      <div className={styles.chatInfoContainer}>
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
      </div>
    </Layout>
  );
};

export default Conversations; 