import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Tooltip, Tabs, Select, Alert, Avatar } from 'antd';
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
import io from 'socket.io-client';
import { BACKEND_URL } from '../../constants/config';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// Define inline styles separately from CSS modules
const inlineStyles = {
  assignmentSection: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fffbe6'  // Light yellow background
  },
  assignmentAlert: {
    marginBottom: 0,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0
  }
};



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
  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

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

  // Add this new effect to fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (id) {
          const response = await axios.get(`/api/leads/${id}/notes`);
          if (response.data) {
            setNotes(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        message.error('Failed to fetch notes');
      }
    };

    if (id) {
      fetchNotes();
    }
  }, [id]);

  // Get assigned user name
  const getAssignedUserName = () => {
    if (!currentAssignee) return 'Admin';
    const assignedUser = users.find(user => user.id === currentAssignee);
    return assignedUser?.name || 'Admin';
  };

  const handleSend = async () => {
    if (message.trim()) {
      try {
        if (activeTab === 'reply') {
          onSendMessage(message);
        } else {
          // Get current user from parent component
          await onAddNote(message);
          // Refresh notes after adding
          const response = await axios.get(`/api/leads/${id}/notes`);
          setNotes(response.data || []);
        }
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('new_whatsapp_message', (message) => {
      console.log('ChatBox received message:', message);
      setMessages(prev => [...prev, {
        message: message.message,
        timestamp: message.timestamp,
        isOutgoing: false,
        from: message.from
      }]);
    });

    return () => newSocket.close();
  }, []);

  // Fetch existing messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (id) {
        try {
          const response = await axios.get(`/api/webhook/messages/${id}`);
          if (response.data.success) {
            setMessages(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [id]);

  const renderMessages = () => {
    return messages.map((message, index) => (
      <div 
        key={index}
        className={`${styles.messageContainer} ${message.isOutgoing ? styles.sentMessage : ''}`}
      >
        <div className={styles.messageBubble}>
          <div className={styles.messageText}>{message.message}</div>
          <div className={styles.messageFooter}>
            <span className={styles.messageTime}>
              {new Date(message.timestamp * 1000).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.messagesContainer}>
        {renderMessages()}
      </div>

      {/* Assignment Alert */}
      <div style={inlineStyles.assignmentSection}>
        <Alert
          message={`This conversation is assigned to ${getAssignedUserName()}`}
          type="warning"
          showIcon
          style={inlineStyles.assignmentAlert}
        />
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
