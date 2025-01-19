import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Tooltip, Tabs, Select, Alert, Avatar, Upload, Modal, message as antMessage, Dropdown, Menu } from 'antd';
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
  UserOutlined,
  AudioOutlined,
  FileOutlined,
  DownloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import styles from './ChatBox.module.css';
import theme from '../../theme';
import axios from 'axios';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../constants/config';
import EmojiPicker from 'emoji-picker-react';

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

// Helper function to safely convert PostgreSQL timestamp to Unix timestamp
const postgresTimestampToUnix = (pgTimestamp) => {
  try {
    // Handle PostgreSQL timestamp with timezone format
    // Example: 2025-01-14 20:58:04.102689+00
    return Math.floor(new Date(pgTimestamp).getTime() / 1000);
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return Math.floor(Date.now() / 1000); // Fallback to current time
  }
};

const ChatBox = ({ 
  onSendMessage, 
  onAddNote, 
  placeholder = "Type a message...",
  currentAssignee = null,
  onAssigneeChange,
  id,
  phone
}) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('reply');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [cannedMessages, setCannedMessages] = useState([]);
  const [showCannedMessages, setShowCannedMessages] = useState(false);
  const [loadingCannedMessages, setLoadingCannedMessages] = useState(false);

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
          const userStr = localStorage.getItem('user');
          const userData = JSON.parse(userStr);
          const userRole = userData?.roles?.role_name;
          const token = localStorage.getItem('user_jwt');

          console.log('ChatBox - Fetch Notes:', {
            leadId: id,
            userData,
            userRole,
            token: token ? 'Token exists' : 'No token'
          });

          const endpoint = userRole === 'admin' ? 
            `/api/leads/${id}/notes` : 
            `/api/user-leads/${id}/notes`;

          const response = await axios.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('ChatBox - Notes Response:', response.data);

          // Check if response has the expected structure
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            const formattedNotes = response.data.data.map(note => ({
              ...note,
              timestamp: postgresTimestampToUnix(note.created_at)
            }));
            setNotes(formattedNotes);
          } else {
            console.error('ChatBox - Unexpected response format:', response.data);
            throw new Error('Invalid response format');
          }
        }
      } catch (error) {
        console.error('ChatBox - Fetch Notes Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          token: localStorage.getItem('user_jwt') ? 'exists' : 'missing'
        });
        antMessage.error('Failed to fetch notes');
      }
    };

    if (id) {
      fetchNotes();
    }
  }, [id]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const token = localStorage.getItem('user_jwt');
        const response = await axios.get('/api/template-messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        antMessage.error('Failed to load templates');
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch canned messages
  useEffect(() => {
    const fetchCannedMessages = async () => {
      setLoadingCannedMessages(true);
      try {
        const token = localStorage.getItem('user_jwt');
        // Log the request for debugging
        console.log('Fetching canned messages...');
        
        const response = await axios.get('/api/canned-messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Canned messages response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setCannedMessages(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch canned messages:', error);
        antMessage.error('Failed to load canned messages');
      } finally {
        setLoadingCannedMessages(false);
      }
    };

    fetchCannedMessages();
  }, []);

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
          const response = await axios.post(`${BACKEND_URL}/api/webhook/reply`, {
            recipient: phone,
            text: message,
            leadId: id
          });

          if (response.data.success) {
            const serverTimestamp = response.data.timestamp || (Date.now() / 1000);
            setMessages(prev => [...prev, {
              id: response.data.messageId || Date.now(),
              message: message,
              timestamp: serverTimestamp,
              is_outgoing: true,
              phone: phone
            }]);
            
            setMessage('');
          } else {
            console.error('Failed to send message:', response.data.error);
          }
        } else {
          // For notes tab
          const token = localStorage.getItem('user_jwt');
          const userStr = localStorage.getItem('user');
          const userData = JSON.parse(userStr);
          const userRole = userData?.roles?.role_name;

          console.log('ChatBox - Adding note:', {
            leadId: id,
            message,
            userData
          });

          // Use appropriate endpoint based on role
          const endpoint = userRole === 'admin' ? 
            `/api/leads/${id}/notes` : 
            `/api/user-leads/${id}/notes`;

          // Add the note
          const noteResponse = await axios.post(endpoint, 
            { note: message },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('ChatBox - Note creation response:', noteResponse.data);

          if (noteResponse.data.success) {
            // Fetch updated notes
            const updatedNotesResponse = await axios.get(endpoint, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (updatedNotesResponse.data.success) {
              const formattedNotes = updatedNotesResponse.data.data.map(note => ({
                ...note,
                timestamp: postgresTimestampToUnix(note.created_at)
              }));
              setNotes(formattedNotes);
            }

            setMessage('');
            antMessage.success('Note added successfully');
          }
        }
      } catch (error) {
        console.error('ChatBox - Error sending message/note:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        antMessage.error('Failed to add note');
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
      antMessage.success('Lead assigned successfully');
    } catch (error) {
      antMessage.error('Failed to assign lead');
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

    newSocket.on('new_whatsapp_message', (messageData) => {
      const timestamp = messageData.timestamp 
        ? new Date(messageData.timestamp * 1000).getTime() / 1000  // Convert to Unix timestamp
        : Math.floor(Date.now() / 1000);

      setMessages(prev => [...prev, {
        id: messageData.id || Date.now(),
        message: messageData.text?.body || messageData.message,
        timestamp: timestamp,
        is_outgoing: false,
        phone: messageData.from
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
            const formattedMessages = response.data.data.map(msg => ({
              id: msg.id,
              message: msg.message,
              media_url: msg.media_url,
              type: msg.type,
              timestamp: new Date(msg.timestamp).getTime() / 1000,
              is_outgoing: msg.is_outgoing,
              phone: msg.phone
            }));
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [id]);

  // Add file upload handler
  const handleUpload = async (file, type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipient', phone);
      formData.append('mediaType', type);
      formData.append('mimeType', file.type);
      formData.append('leadId', id);
      
      const uploadResponse = await axios.post(`${BACKEND_URL}/api/webhook/send-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (uploadResponse.data.success) {
        antMessage.success('File sent successfully');
        const serverTimestamp = Math.floor(Date.now() / 1000);
        setMessages(prev => [...prev, {
          id: uploadResponse.data.messageId || Date.now(),
          message: type === 'document' ? `[Document: ${file.name}]` : '[Audio Message]',
          media_url: uploadResponse.data.data.url,
          timestamp: serverTimestamp,
          is_outgoing: true,
          phone: phone,
          type: type
        }]);
      } else {
        antMessage.error('Failed to send file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      antMessage.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
      setFileList([]);
    }
  };

  // Add this handler for emoji selection
  const onEmojiClick = (emojiObject) => {
    const cursor = message.length;
    const text = message.slice(0, cursor) + emojiObject.emoji + message.slice(cursor);
    setMessage(text);
  };

  // Helper function to extract plain text from template JSON
  const extractTextFromTemplate = (templateMessage) => {
    try {
      if (typeof templateMessage === 'string') {
        // Try to parse if it's a JSON string
        const parsed = JSON.parse(templateMessage);
        if (parsed.blocks) {
          // Extract text from blocks and preserve emojis
          return parsed.blocks
            .map(block => {
              let text = block.text;
              // If there are entity ranges (emojis), make sure they're preserved
              if (block.entityRanges && parsed.entityMap) {
                block.entityRanges.forEach(range => {
                  const entity = parsed.entityMap[range.key];
                  if (entity.type === 'emoji' && entity.data.emojiUnicode) {
                    // Preserve the emoji in the text
                    text = text.trim();
                  }
                });
              }
              return text;
            })
            .filter(text => text.trim()) // Remove empty lines
            .join(' '); // Join with spaces instead of newlines
        }
      }
      // If it's already a string, return as is
      return templateMessage;
    } catch (error) {
      console.error('Error parsing template:', error);
      return templateMessage; // Return original if parsing fails
    }
  };

  // Template menu items
  const templateMenu = (
    <Menu className={styles.templateMenu}>
      {templates.map(template => (
        <Menu.Item 
          key={template.id}
          onClick={() => {
            try {
              const messageText = extractTextFromTemplate(template.template_message);
              setMessage(messageText);
            } catch (error) {
              console.error('Error setting template:', error);
              antMessage.error('Failed to load template content');
            }
          }}
        >
          {template.title}
        </Menu.Item>
      ))}
      {templates.length === 0 && (
        <Menu.Item disabled>No templates available</Menu.Item>
      )}
    </Menu>
  );

  // Handle text area change with canned messages trigger
  const handleMessageChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Show canned messages dropdown when "/" is typed
    if (newValue.endsWith('/')) {
      setShowCannedMessages(true);
    } else {
      setShowCannedMessages(false);
    }
  };

  // Canned messages menu
  const cannedMessagesMenu = (
    <Menu 
      className={styles.cannedMessagesMenu}
      style={{ 
        display: showCannedMessages ? 'block' : 'none',
        position: 'absolute',
        bottom: '100%',
        left: 0,
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {cannedMessages.map(msg => (
        <Menu.Item 
          key={msg.id}
          onClick={() => {
            // Remove the trigger character "/" and set the message
            setMessage(message.slice(0, -1) + msg.message);
            setShowCannedMessages(false);
          }}
        >
          {msg.title}
        </Menu.Item>
      ))}
      {cannedMessages.length === 0 && (
        <Menu.Item disabled>No canned messages available</Menu.Item>
      )}
    </Menu>
  );

  const renderMessages = () => {
    const combinedMessages = [
      ...messages.map(msg => ({
        ...msg,
        type: msg.type || 'text',
        timestamp: typeof msg.timestamp === 'string' 
          ? postgresTimestampToUnix(msg.timestamp)
          : msg.timestamp
      })),
      ...notes.map(note => ({
        id: note.id,
        message: note.note || '',
        // Properly convert PostgreSQL timestamp
        timestamp: postgresTimestampToUnix(note.created_at),
        type: 'note',
        user: note.users?.name || 'Unknown'
      }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {combinedMessages.map((item, index) => {
          const messageTime = new Date(item.timestamp * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });

          if (item.type === 'document') {
            return (
              <div 
                key={item.id || index}
                className={`${styles.messageContainer} ${item.is_outgoing ? styles.sentMessage : styles.receivedMessage}`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageText}>
                    <div className={styles.documentPreview}>
                      <FileOutlined className={styles.documentIcon} />
                      <span>{item.message}</span>
                      {item.media_url && (
                        <Button 
                          type="link" 
                          icon={<DownloadOutlined />}
                          onClick={() => window.open(item.media_url, '_blank')}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className={styles.messageTime}>{messageTime}</div>
                </div>
              </div>
            );
          } else if (item.type === 'note') {
            return (
              <div 
                key={item.id || index}
                className={`${styles.messageContainer} ${styles.noteMessage}`}
              >
                <div className={`${styles.messageBubble} ${styles.noteBubble}`}>
                  <div className={styles.noteHeader}>
                    <small>Note by {item.user}</small>
                  </div>
                  <div className={`${styles.messageText} ${styles.noteText}`}>
                    {item.message}
                  </div>
                  <div className={styles.messageFooter}>
                    <span className={styles.messageTime}>
                      {messageTime}
                    </span>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div 
                key={item.id || index}
                className={`${styles.messageContainer} ${item.is_outgoing ? styles.sentMessage : styles.receivedMessage}`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageText}>
                    {item.message}
                  </div>
                  <div className={styles.messageFooter}>
                    <span className={styles.messageTime}>{messageTime}</span>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Add auto-scroll to bottom for new messages
  useEffect(() => {
    const messagesContainer = document.querySelector(`.${styles.messagesContainer}`);
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

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
          items={[
            {
              key: 'reply',
              label: 'Reply',
              children: (
                <div className={styles.messageInput}>
                  <div className={styles.emojiPickerContainer}>
                    <Button 
                      type="text" 
                      icon={<SmileOutlined />}
                      className={styles.iconButton}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    />
                    {showEmojiPicker && (
                      <div className={styles.emojiPickerWrapper}>
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                  <Upload
                    beforeUpload={handleUpload}
                    fileList={fileList}
                    showUploadList={false}
                  >
                    <Button 
                      type="text" 
                      icon={<PaperClipOutlined />}
                      className={styles.iconButton}
                      loading={uploading}
                    />
                  </Upload>
                  <Dropdown 
                    overlay={templateMenu} 
                    trigger={['click']}
                    disabled={loadingTemplates}
                  >
                    <Button
                      type="text"
                      icon={<FileTextOutlined />}
                      className={styles.iconButton}
                      loading={loadingTemplates}
                    />
                  </Dropdown>
                  <div style={{ position: 'relative' }}>
                    {cannedMessagesMenu}
                    <TextArea
                      value={message}
                      onChange={handleMessageChange}
                      onKeyPress={handleKeyPress}
                      placeholder={placeholder}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className={styles.textarea}
                    />
                  </div>
                  <Button 
                    type="text"
                    icon={<SendOutlined />} 
                    onClick={handleSend}
                    className={styles.iconButton}
                  />
                </div>
              )
            },
            {
              key: 'notes',
              label: 'Notes',
              children: (
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
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ChatBox;
