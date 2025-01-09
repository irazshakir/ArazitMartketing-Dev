import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Tooltip, Tabs, Select, Alert } from 'antd';
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  StrikethroughOutlined,
  ItalicOutlined,
  BoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  UserOutlined
} from '@ant-design/icons';
import styles from './ChatBox.module.css';
import theme from '../../theme';
import axios from 'axios';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const ChatBox = ({ 
  onSendMessage, 
  onAddNote, 
  placeholder = "Type a message...",
  currentAssignee = null,
  onAssigneeChange,
  id
}) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('reply');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/users?active=true');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get assigned user name
  const getAssignedUserName = () => {
    if (!currentAssignee) return 'Admin';
    const assignedUser = users.find(user => user.id === currentAssignee);
    return assignedUser?.name || 'Admin';
  };

  const handleSend = () => {
    if (message.trim()) {
      if (activeTab === 'reply') {
        onSendMessage(message);
      } else {
        onAddNote(message);
      }
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add user assignment handler
  const handleAssignUser = async (userId) => {
    try {
      await axios.patch(`/api/leads/assign/${id}`, {
        assigned_user: userId
      });
      onAssigneeChange(userId);
      message.success('Lead assigned successfully');
    } catch (error) {
      message.error('Failed to assign lead');
    }
  };

  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.assignmentSection}>
        <Alert
          message={`This conversation is assigned to ${getAssignedUserName()}`}
          type="warning"
          showIcon
          className={styles.assignmentAlert}
          action={
            <Select
              placeholder="Reassign to"
              onChange={handleAssignUser}
              value={currentAssignee}
              style={{ width: 120 }}
              loading={loading}
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </Select>
          }
        />
      </div>
      {/* Message Display Area */}
      <div className={styles.messagesContainer}>
        {/* Messages will be rendered here */}
      </div>

      {/* Input Area */}
      <div className={styles.inputContainer}>
        {/* Formatting Tools */}
        <div className={styles.formattingTools}>
          <Tooltip title="Bold">
            <Button type="text" icon={<BoldOutlined />} />
          </Tooltip>
          <Tooltip title="Italic">
            <Button type="text" icon={<ItalicOutlined />} />
          </Tooltip>
          <Tooltip title="Strikethrough">
            <Button type="text" icon={<StrikethroughOutlined />} />
          </Tooltip>
          <Tooltip title="Bullet List">
            <Button type="text" icon={<UnorderedListOutlined />} />
          </Tooltip>
          <Tooltip title="Numbered List">
            <Button type="text" icon={<OrderedListOutlined />} />
          </Tooltip>
          <Tooltip title="Align">
            <Button type="text" icon={<AlignLeftOutlined />} />
          </Tooltip>
        </div>

        {/* Message Input with Tabs */}
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          className={styles.tabs}
          style={{
            '& .ant-tabs-ink-bar': {
              backgroundColor: theme.colors.primary
            }
          }}
        >
          <TabPane tab="Reply" key="reply">
            <div className={styles.messageInput}>
              <Button 
                type="text" 
                icon={<SmileOutlined />}
                className={styles.iconButton}
              />
              <Button 
                type="text" 
                icon={<PaperClipOutlined />}
                className={styles.iconButton}
              />
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={styles.textarea}
              />
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                className={styles.sendButton}
                style={{ backgroundColor: theme.colors.primary }}
              />
            </div>
          </TabPane>
          <TabPane tab="Notes" key="notes">
            <div className={`${styles.messageInput} ${styles.notesInput}`}>
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add an internal note..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className={styles.textarea}
              />
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                className={styles.sendButton}
                style={{ backgroundColor: theme.colors.primary }}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatBox;
