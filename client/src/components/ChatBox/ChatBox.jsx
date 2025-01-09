import React, { useState } from 'react';
import { Input, Button, Typography, Tooltip } from 'antd';
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  StrikethroughOutlined,
  ItalicOutlined,
  BoldOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined
} from '@ant-design/icons';
import styles from './ChatBox.module.css';

const { TextArea } = Input;

const ChatBox = ({ onSendMessage, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatBoxContainer}>
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

        {/* Message Input */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
