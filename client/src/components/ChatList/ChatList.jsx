import React, { useState, useEffect } from 'react';
import { List, Avatar, Typography, Space, Badge, Input, Tooltip, Tabs } from 'antd';
import { 
  WhatsAppOutlined, 
  SearchOutlined, 
  FilterOutlined,
  UserOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  PushpinFilled,
  FolderOpenOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import './ChatList.styles.css';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../constants/config';
import axios from 'axios';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;
const { TabPane } = Tabs;

const ChatList = ({ chats, onChatSelect, selectedChatId }) => {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socket, setSocket] = useState(null);
  const [boldChats, setBoldChats] = useState({});
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [assignedUsers, setAssignedUsers] = useState({});

  // Add function to truncate message to three words
  const truncateToThreeWords = (message) => {
    if (!message) return '';
    const words = message.split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

  useEffect(() => {
    const fetchLastMessageTimes = async () => {
      try {
        const promises = chats.map(chat => 
          axios.get(`/api/messages/last-message-time/${chat.id}`)
        );
        
        const responses = await Promise.all(promises);
        
        const times = {};
        const messages = {};
        responses.forEach((response, index) => {
          if (response.data && response.data.timestamp) {
            times[chats[index].id] = response.data.timestamp;
            messages[chats[index].id] = truncateToThreeWords(response.data.message);
          }
        });
        
        setLastMessageTimes(times);
        setLastMessages(messages);
      } catch (error) {
        console.error('Error fetching last message times:', error);
      }
    };

    if (chats.length > 0) {
      fetchLastMessageTimes();
    }
  }, [chats]);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('new_whatsapp_message', (message) => {
      console.log('📩 New message received in ChatList:', message);
      
      // Update unread counts and bold status
      setUnreadCounts(prev => ({
        ...prev,
        [message.from]: (prev[message.from] || 0) + 1
      }));

      setBoldChats(prev => ({
        ...prev,
        [message.from]: true
      }));

      // Find existing chat
      const existingChatIndex = chats.findIndex(chat => 
        chat.phone === message.from || chat.id === message.leadId
      );

      const truncatedMessage = truncateToThreeWords(message.text.body);

      if (existingChatIndex === -1) {
        // Create new chat
        const newChat = {
          id: message.leadId,
          name: message.name,
          phone: message.from,
          lastMessage: truncatedMessage,
          whatsapp: true,
          assigned_user: message.assigned_user || 'Unassigned'
        };
        chats.unshift(newChat);
      } else {
        // Update existing chat
        const updatedChat = {
          ...chats[existingChatIndex],
          lastMessage: truncatedMessage
        };
        
        // Remove chat from current position and add to beginning
        chats.splice(existingChatIndex, 1);
        chats.unshift(updatedChat);
      }

      // Update last message and time
      setLastMessageTimes(prev => ({
        ...prev,
        [message.leadId]: new Date().toISOString()
      }));
      
      setLastMessages(prev => ({
        ...prev,
        [message.leadId]: truncatedMessage
      }));
    });

    return () => newSocket.close();
  }, [chats]);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        // Get unique user IDs from chats
        const userIds = [...new Set(chats
          .map(chat => chat.assigned_user)
          .filter(id => id))];

        if (userIds.length === 0) return;

        // Use the same API endpoint as ChatBox
        const response = await axios.get('/api/users?active=true');
        const users = response.data;

        // Create a map of user details
        const userMap = {};
        users.forEach(user => {
          if (userIds.includes(user.id)) {
            userMap[user.id] = {
              name: user.name,
              role: user.role
            };
          }
        });

        setAssignedUsers(userMap);
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      }
    };

    fetchAssignedUsers();
  }, [chats]);

  // Add helper function to get badge color
  const getBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#52c41a'; // green
      case 'user':
        return '#fa8c16'; // orange
      default:
        return '#d9d9d9'; // default gray
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const time = timestamp.split('T')[1].split('.')[0];
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const tabItems = [
    {
      key: 'unassigned',
      icon: <UserOutlined />,
      label: 'Unassigned'
    },
    {
      key: 'mine',
      icon: <UserSwitchOutlined />,
      label: 'Mine'
    },
    {
      key: 'mentions',
      icon: <MessageOutlined />,
      label: 'Mentions'
    },
    {
      key: 'pinned',
      icon: <PushpinFilled />,
      label: 'Pinned'
    },
    {
      key: 'open',
      icon: <FolderOpenOutlined />,
      label: 'Open'
    },
    {
      key: 'resolved',
      icon: <CheckCircleOutlined />,
      label: 'Resolved'
    }
  ];

  const renderItem = (chat) => (
    <List.Item 
      className={`chat-list-item ${selectedChatId === chat.id ? 'selected' : ''}`}
      onClick={() => {
        onChatSelect(chat);
        setUnreadCounts(prev => ({
          ...prev,
          [chat.id]: 0
        }));
        setBoldChats(prev => ({
          ...prev,
          [chat.phone]: false
        }));
      }}
    >
      <List.Item.Meta
        avatar={
          <Badge count={unreadCounts[chat.id] || 0}>
            <Avatar>{chat.name?.[0]}</Avatar>
          </Badge>
        }
        title={
          <div className="chat-header">
            <div className="chat-title-container">
              <Text strong className="chat-name" style={{ 
                fontWeight: boldChats[chat.phone] ? 'bold' : 'normal' 
              }}>
                {chat.name}
              </Text>
              <Text type="secondary" className="chat-time">
                {formatTime(lastMessageTimes[chat.id])}
              </Text>
            </div>
            <div className="chat-subtitle">
              {chat.assigned_user && assignedUsers[chat.assigned_user] ? (
                <Badge
                  color={getBadgeColor(assignedUsers[chat.assigned_user].role)}
                  text={assignedUsers[chat.assigned_user].name}
                  style={{ fontSize: '12px' }}
                />
              ) : (
                <Text type="secondary" className="assigned-user">
                  Unassigned
                </Text>
              )}
              {chat.whatsapp && <WhatsAppOutlined className="whatsapp-icon" />}
            </div>
          </div>
        }
        description={
          <div className="chat-description">
            <Text className="chat-message" style={{ 
              fontWeight: boldChats[chat.phone] ? 'bold' : 'normal' 
            }}>
              {lastMessages[chat.id] || truncateToThreeWords(chat.lastMessage)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="chat-list-container">
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <Input
          placeholder="Search conversations..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          className="search-input"
        />
        <Tooltip title="Filter">
          <FilterOutlined className="filter-icon" />
        </Tooltip>
      </div>

      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="chat-tabs"
        tabPosition="top"
        tabBarStyle={{ margin: 0 }}
      >
        {tabItems.map(item => (
          <TabPane
            key={item.key}
            tab={
              <Tooltip title={item.label}>
                {item.icon}
              </Tooltip>
            }
          >
            <List
              className="chat-list"
              itemLayout="horizontal"
              dataSource={chats}
              renderItem={renderItem}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default ChatList;
