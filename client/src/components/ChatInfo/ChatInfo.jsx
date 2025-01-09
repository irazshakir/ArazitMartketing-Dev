import React from 'react';
import { Typography, Button, Avatar, Tag } from 'antd';
import { WhatsAppOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './ChatInfo.module.css';

const { Title, Text } = Typography;

const ChatInfo = ({ 
  contact = {}, 
  onAddTag, 
  onLinkCompany 
}) => {
  return (
    <div className={styles.chatInfoContainer}>
      {/* Contact Header */}
      <div className={styles.contactHeader}>
        <Avatar size={40}>{contact.name?.[0] || 'D'}</Avatar>
        <div className={styles.contactName}>
          <Text strong>{contact.name || 'dilkumars918'}</Text>
          {contact.whatsapp && (
            <WhatsAppOutlined className={styles.whatsappIcon} />
          )}
        </div>
      </div>

      {/* Marketing Opt-In */}
      <div className={styles.infoSection}>
        <Text type="secondary">Marketing Opt-In</Text>
        <Text strong>{contact.marketingOptIn ? 'Yes' : 'No'}</Text>
      </div>

      {/* Phone Number */}
      <div className={styles.infoSection}>
        <Text type="secondary">Phone Number</Text>
        <Text strong>{contact.phone || '-'}</Text>
      </div>

      {/* Email */}
      <div className={styles.infoSection}>
        <Text type="secondary">Email</Text>
        <Text strong>{contact.email || '-'}</Text>
      </div>

      {/* Contact Owner */}
      <div className={styles.infoSection}>
        <Text type="secondary">Contact Owner</Text>
        {contact.owner ? (
          <div className={styles.ownerInfo}>
            <Avatar size="small">{contact.owner[0]}</Avatar>
            <Text strong>{contact.owner}</Text>
          </div>
        ) : (
          <Text strong>-</Text>
        )}
      </div>

      {/* Contact Tags */}
      <div className={styles.infoSection}>
        <Text type="secondary">Contact Tags</Text>
        <div className={styles.tagsContainer}>
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={onAddTag}
            size="small"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Company Details */}
      <div className={styles.sectionHeader}>
        <Title level={5}>Company Details</Title>
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          onClick={onLinkCompany}
        >
          Link company
        </Button>
      </div>

      {/* Source Information */}
      <div className={styles.collapsibleSection}>
        <Title level={5}>Source</Title>
        <div className={styles.infoSection}>
          <Text type="secondary">Contact Created Source</Text>
          <Text strong>{contact.source || 'CTWA'}</Text>
        </div>
        <div className={styles.infoSection}>
          <Text type="secondary">Source ID</Text>
          <Text strong copyable>{contact.sourceId || '120214657461450166'}</Text>
        </div>
        <div className={styles.infoSection}>
          <Text type="secondary">Source URL</Text>
          <Text strong className={styles.urlText}>
            {contact.sourceUrl || 'https://fb.me/2iwHNEzgK'}
          </Text>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className={styles.collapsibleSection}>
        <Title level={5}>Additional Details</Title>
        {/* Add additional details content here */}
      </div>
    </div>
  );
};

export default ChatInfo; 