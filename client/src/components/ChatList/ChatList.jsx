import React, { useState, useEffect } from 'react';
import { List, Avatar, Typography, Space, Badge, Input, Tooltip, Tabs, Tag } from 'antd';
import { 
  WhatsAppOutlined, 
  SearchOutlined, 
  FilterOutlined,
  UserOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  PushpinFilled,
  FolderOpenOutlined,
  CheckCircleOutlined,
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

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socket, setSocket] = useState(null);
  const [boldChats, setBoldChats] = useState({});
  const [lastMessageTimes, setLastMessageTimes] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [assignedUsers, setAssignedUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [filteredChats, setFilteredChats] = useState([]);

  // Add function to truncate message to three words
  const truncateToThreeWords = (message) => {
    if (!message) return '';
    const words = message.split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

  // Add function to get logged in user ID
  const getLoggedInUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
  };

  // Update fetchFilteredChats function with debug logs
  const fetchFilteredChats = async (filter) => {
    setLoading(true);
    try {
      const userId = getLoggedInUserId();
      console.log('Fetching chats with filter:', filter);
      console.log('User ID:', userId);

      const response = await axios.get(`/api/webhook/filtered-chats?filter=${filter}&user_id=${userId}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setFilteredChats(response.data.data);
        console.log('Filtered Chats:', response.data.data);
        
        // Fetch last messages for new chats
        const promises = response.data.data.map(chat => 
          axios.get(`/api/messages/last-message-time/${chat.id}`)
        );
        
        const messageResponses = await Promise.all(promises);
        console.log('Message Responses:', messageResponses);
        
        const times = {};
        const messages = {};
        messageResponses.forEach((response, index) => {
          if (response.data && response.data.timestamp) {
            times[response.data.id] = response.data.timestamp;
            messages[response.data.id] = truncateToThreeWords(response.data.message);
          }
        });
        
        setLastMessageTimes(times);
        setLastMessages(messages);
      }
    } catch (error) {
      console.error('Error fetching filtered chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch chats when tab changes
  useEffect(() => {
    console.log('Tab changed to:', activeTab);
    fetchFilteredChats(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchLastMessageTimes = async () => {
      try {
        const promises = filteredChats.map(chat => 
          axios.get(`/api/messages/last-message-time/${chat.id}`)
        );
        
        const responses = await Promise.all(promises);
        
        const times = {};
        const messages = {};
        responses.forEach((response, index) => {
          if (response.data && response.data.timestamp) {
            times[filteredChats[index].id] = response.data.timestamp;
            messages[filteredChats[index].id] = truncateToThreeWords(response.data.message);
          }
        });
        
        setLastMessageTimes(times);
        setLastMessages(messages);
      } catch (error) {
        console.error('Error fetching last message times:', error);
      }
    };

    if (filteredChats.length > 0) {
      fetchLastMessageTimes();
    }
  }, [filteredChats]);

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
      const existingChatIndex = filteredChats.findIndex(chat => 
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
        filteredChats.unshift(newChat);
      } else {
        // Update existing chat
        const updatedChat = {
          ...filteredChats[existingChatIndex],
          lastMessage: truncatedMessage
        };
        
        // Remove chat from current position and add to beginning
        filteredChats.splice(existingChatIndex, 1);
        filteredChats.unshift(updatedChat);
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
  }, [filteredChats]);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        // Get unique user IDs from chats
        const userIds = [...new Set(filteredChats
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
  }, [filteredChats]);

  // Add helper function to get badge color
  const getBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#f6ffed'; // light green background
      case 'user':
        return '#fff7e6'; // light orange background
      case 'manager':
        return '#feffe6'; // light yellow background
      default:
        return '#f5f5f5'; // default gray
    }
  };

  // Add getBorderColor function for tag borders
  const getBorderColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#b7eb8f'; // green border
      case 'user':
        return '#ffd591'; // orange border
      case 'manager':
        return '#fffb8f'; // yellow border
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

  // Update tabItems to include all six tabs
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
      key: 'pinned',
      icon: <PushpinFilled />,
      label: 'Pinned'
    },
    {
      key: 'mentions',
      icon: <MessageOutlined />,
      label: 'Mentions'
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

  const renderItem = (chat) => {
    console.log('Rendering chat:', chat);
    return (
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
              <div className="chat-subtitle" style={{ 
                marginBottom: '8px',
                display: 'flex',
                flexDirection: 'column',  // Stack items vertically
                gap: '4px'  // Add space between tag and icon
              }}> 
                {chat.assigned_user && assignedUsers[chat.assigned_user] ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag 
                      style={{ 
                        margin: 0,
                        padding: '2px 8px',
                        fontSize: '12px',
                        backgroundColor: getBadgeColor(assignedUsers[chat.assigned_user].role),
                        border: `1px solid ${getBorderColor(assignedUsers[chat.assigned_user].role)}`,
                        borderRadius: '4px'
                      }}
                    >
                      {assignedUsers[chat.assigned_user].name}
                    </Tag>
                  </div>
                ) : (
                  <Text type="secondary" className="assigned-user">
                    Unassigned
                  </Text>
                )}
                {chat.whatsapp && (
                  <WhatsAppOutlined 
                    className="whatsapp-icon" 
                    style={{ 
                      color: '#25D366',
                      fontSize: '16px'
                    }}
                  />
                )}
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
  };

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
        onChange={(key) => {
          console.log('Tab clicked:', key);
          setActiveTab(key);
        }}
        className="chat-tabs"
        tabPosition="top"
        tabBarStyle={{ 
          margin: 0,
          display: 'flex',
          justifyContent: 'space-between'
        }}
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
            {(item.key === 'pinned' || item.key === 'mentions') ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                color: '#999'
              }}>
                No data available
              </div>
            ) : (
              <List
                className="chat-list"
                itemLayout="horizontal"
                dataSource={filteredChats}
                renderItem={renderItem}
                loading={loading}
              />
            )}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default ChatList;
