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
import './ChatList.styles.css';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../constants/config';

const { Text } = Typography;
const { TabPane } = Tabs;

const ChatList = ({ chats, onChatSelect, selectedChatId }) => {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    newSocket.on('new_whatsapp_message', (message) => {
      console.log('📩 New message received in ChatList:', message);
      console.log('Current chats:', chats);

      setUnreadCounts(prev => {
        const newCounts = {
          ...prev,
          [message.from]: (prev[message.from] || 0) + 1
        };
        console.log('Updated unread counts:', newCounts);
        return newCounts;
      });

      const existingChat = chats.find(chat => chat.phone === message.from);
      console.log('Existing chat found:', existingChat);

      if (!existingChat) {
        const newChat = {
          id: message.leadId,
          name: message.name,
          phone: message.from,
          time: message.timestamp,
          lastMessage: message.text.body,
          whatsapp: true
        };
        console.log('Creating new chat:', newChat);
        chats.unshift(newChat);
      } else {
        console.log('Updating existing chat:', message.from);
        existingChat.lastMessage = message.text.body;
        existingChat.time = message.timestamp;
      }
    });

    return () => {
      console.log('🔌 Closing socket connection');
      newSocket.close();
    };
  }, [chats]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).format('HH:mm A');
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
              <Text strong className="chat-name">{chat.name}</Text>
              <Text type="secondary" className="chat-time">
                {formatTime(chat.time)}
              </Text>
            </div>
            <WhatsAppOutlined className="whatsapp-icon" />
          </div>
        }
        description={
          <div className="chat-description">
            <Text className="chat-message">
              {chat.lastMessage}
            </Text>
            {chat.assigned_user_name && (
              <div className="agent-info">
                <Avatar 
                  size="small" 
                  className="agent-avatar"
                >
                  {chat.assigned_user_name.charAt(0)}
                </Avatar>
                <Text type="secondary" className="agent-name">
                  {chat.assigned_user_name}
                </Text>
              </div>
            )}
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
