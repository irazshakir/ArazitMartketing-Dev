import React, { useState } from 'react';
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

const { Text } = Typography;
const { TabPane } = Tabs;

const ChatList = ({ chats, onChatSelect, selectedChatId }) => {
  const [activeTab, setActiveTab] = useState('unassigned');

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
              renderItem={(chat) => (
                <List.Item 
                  className={`chat-list-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                  onClick={() => onChatSelect(chat)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        className="chat-avatar"
                        style={{ 
                          backgroundColor: '#ff4d4f',
                          color: '#fff'
                        }}
                      >
                        {chat.name?.substring(0, 2).toUpperCase()}
                      </Avatar>
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
              )}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default ChatList;
