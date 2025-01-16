import React, { useState, useEffect, useCallback } from 'react';
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
import { debounce } from 'lodash';

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
  const [tabBadges, setTabBadges] = useState({
    unassigned: 0,
    mine: 0
  });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="danger">Error loading chats. Please refresh the page.</Text>
      </div>
    );
  }

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
  const fetchFilteredChats = async (filter, search = '') => {
    setLoading(true);
    try {
      const userId = getLoggedInUserId();
      console.log('Fetching chats with filter:', filter, 'search:', search);

      const response = await axios.get(`/api/webhook/filtered-chats?filter=${filter}&user_id=${userId}&searchQuery=${search}`);
      
      if (response.data.success) {
        setFilteredChats(response.data.data);
        
        // Fetch last messages for new chats
        const promises = response.data.data.map(chat => 
          axios.get(`/api/messages/last-message-time/${chat.id}`)
        );
        
        const messageResponses = await Promise.all(promises);
        
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

  // Add debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      fetchFilteredChats(activeTab, value);
    }, 300),
    [activeTab]
  );

  // Update search input handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Add useEffect to fetch chats when tab changes
  useEffect(() => {
    console.log('Tab or search changed:', activeTab, searchQuery);
    fetchFilteredChats(activeTab, searchQuery);
  }, [activeTab]); // Remove searchQuery from dependencies since we're using debounce

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
      
      setUnreadCounts(prev => ({
        ...prev,
        [message.leadId]: message.unreadCount || prev[message.leadId] || 0
      }));

      setFilteredChats(prev => {
        const existingChatIndex = prev.findIndex(chat => chat.id === message.leadId);
        
        // Determine the message preview based on message type
        let messagePreview = '';
        if (message.type === 'document') {
          messagePreview = `[Document: ${message.filename || 'File'}]`;
        } else if (message.type === 'audio') {
          messagePreview = '[Audio Message]';
        } else {
          messagePreview = message.text?.body || message.message || 'New message';
        }

        if (existingChatIndex === -1) {
          // Create new chat if it doesn't exist
          const newChat = {
            id: message.leadId,
            name: message.name || `WhatsApp Lead (${message.from})`,
            phone: message.from,
            lastMessage: messagePreview,
            whatsapp: true,
            assigned_user: message.assigned_user || null
          };
          return [newChat, ...prev];
        } else {
          // Update existing chat in place
          return prev.map((chat, index) => {
            if (index === existingChatIndex) {
              return {
                ...chat,
                lastMessage: messagePreview
              };
            }
            return chat;
          });
        }
      });

      setBoldChats(prev => ({
        ...prev,
        [message.from]: true
      }));
    });

    // Fetch initial unread counts
    fetchUnreadCounts();

    return () => newSocket.close();
  }, []);  // Keep empty dependency array since we're using functional updates

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

  // Add function to fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const userId = getLoggedInUserId();
      const response = await axios.get(`/api/webhook/unread-counts?user_id=${userId}`);
      if (response.data.success) {
        setTabBadges(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  // Update socket effect to handle unread counts
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('unread_counts_update', (counts) => {
      console.log('Received unread counts update:', counts); // Debug log
      setTabBadges({
        unassigned: counts.unassigned || 0,
        mine: counts.mine || 0
      });
      setUnreadCounts(counts.perChat || {});
    });

    // Fetch initial counts
    fetchUnreadCounts();

    return () => newSocket.close();
  }, []);

  // Update tabItems to include badges
  const tabItems = [
    {
      key: 'unassigned',
      icon: (
        <Badge 
          count={tabBadges.unassigned} 
          size="small"
          offset={[0, 0]}
        >
          <UserOutlined />
        </Badge>
      ),
      label: 'Unassigned'
    },
    {
      key: 'mine',
      icon: (
        <Badge 
          count={tabBadges.mine} 
          size="small"
          offset={[0, 0]}
        >
          <UserSwitchOutlined />
        </Badge>
      ),
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

  const handleChatSelect = async (chat) => {
    try {
      const userId = getLoggedInUserId();
      // Mark messages as read
      await axios.post(`/api/webhook/messages/${chat.id}/read?user_id=${userId}`);
      
      // Reset bold text for the selected chat
      setBoldChats(prev => ({
        ...prev,
        [chat.phone]: false
      }));
      
      // Call the original onChatSelect
      onChatSelect(chat);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const renderItem = (chat) => {
    console.log('Rendering chat:', chat);
    console.log('Unread counts:', unreadCounts);
    
    if (!chat || !chat.id) {
      console.log('Invalid chat object:', chat);
      return null;
    }

    const unreadCount = unreadCounts[chat.id] || 0;
    const avatarText = chat.name ? chat.name.charAt(0).toUpperCase() : '?';
    
    return (
      <List.Item 
        className={`chat-list-item ${selectedChatId === chat.id ? 'selected' : ''}`}
        onClick={() => handleChatSelect(chat)}
      >
        <List.Item.Meta
          avatar={
            <Badge 
              count={unreadCount}
              size="small"
              offset={[8, 0]}
              style={{ backgroundColor: '#ff4d4f' }}
            >
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {avatarText}
              </Avatar>
            </Badge>
          }
          title={
            <div className="chat-header">
              <div className="chat-title-container">
                <Text strong className="chat-name" style={{ 
                  fontWeight: boldChats[chat.phone] ? 'bold' : 'normal' 
                }}>
                  {chat.name || 'Unknown Contact'}
                </Text>
                <Text type="secondary" className="chat-time">
                  {formatTime(lastMessageTimes[chat.id])}
                </Text>
              </div>
              <div className="chat-subtitle" style={{ 
                marginBottom: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
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
                {lastMessages[chat.id] || truncateToThreeWords(chat.lastMessage) || 'No message'}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  try {
    return (
      <div className="chat-list-container">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <Input
            placeholder="Search conversations..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            allowClear
          />
          <Tooltip title="Filter">
            <FilterOutlined className="filter-icon" />
          </Tooltip>
        </div>

        {/* Tabs Section */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
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
  } catch (err) {
    console.error('Render error:', err);
    setError(err);
    return null;
  }
};

export default ChatList;
