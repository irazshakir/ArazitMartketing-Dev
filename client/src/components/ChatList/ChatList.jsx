import React from 'react';
import { List, Avatar, Typography, Space, Badge } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './ChatList.styles.css';

const { Text } = Typography;

const ChatList = ({ chats, onChatSelect, selectedChatId }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).format('HH:mm A');
  };

  return (
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
  );
};

export default ChatList;
