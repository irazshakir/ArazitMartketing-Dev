import React from 'react';
import { List, Avatar, Typography, Space, Badge } from 'antd';
import { WhatsAppOutlined, CopyOutlined } from '@ant-design/icons';
import './ChatList.styles.css';

const ChatList = ({ chats, onChatSelect, selectedChatId }) => {
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
                  backgroundColor: chat.avatarColor || '#f56a00',
                }}
              >
                {chat.name?.substring(0, 2).toUpperCase()}
              </Avatar>
            }
            title={
              <Space align="center" className="chat-title">
                <Typography.Text strong>{chat.name}</Typography.Text>
                <Typography.Text type="secondary" className="chat-time">
                  {chat.time}
                </Typography.Text>
                <Space>
                  {chat.whatsapp && (
                    <WhatsAppOutlined className="whatsapp-icon" />
                  )}
                  {chat.copied && (
                    <Badge dot>
                      <CopyOutlined className="copy-icon" />
                    </Badge>
                  )}
                </Space>
              </Space>
            }
            description={
              <Space direction="vertical" size={2}>
                <Typography.Text className="chat-message">
                  {chat.lastMessage}
                </Typography.Text>
                {chat.agent && (
                  <Space size={4}>
                    <Avatar 
                      size="small" 
                      className="agent-avatar"
                      style={{
                        backgroundColor: '#ffd6e7',
                        color: '#eb2f96'
                      }}
                    >
                      {chat.agent.substring(0, 1)}
                    </Avatar>
                    <Typography.Text type="secondary" className="agent-name">
                      {chat.agent}
                    </Typography.Text>
                  </Space>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ChatList;
