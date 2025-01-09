import React, { useState, useEffect } from 'react';
import { Typography, Button, Avatar, Input, DatePicker, TimePicker, Select, Switch, message } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import styles from './ChatInfo.module.css';
import axios from 'axios';
import dayjs from 'dayjs';
import theme from '../../theme';

const { Title, Text } = Typography;
const { Option } = Select;

const ChatInfo = ({ 
  contact = {}, 
}) => {
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [isActive, setIsActive] = useState(contact.lead_is_active);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, stagesRes, sourcesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/stages'),
          axios.get('/api/lead-sources')
        ]);
        
        setProducts(productsRes.data);
        setStages(stagesRes.data);
        setLeadSources(sourcesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.patch(`/api/leads/${contact.id}`, {
        phone: contact.phone,
        email: contact.email,
        follow_date: contact.followDate,
        follow_time: contact.followTime,
        product_id: contact.productId,
        stage_id: contact.stageId,
        lead_source_id: contact.leadSourceId,
        lead_is_active: isActive
      });
      message.success('Lead updated successfully');
    } catch (error) {
      message.error('Failed to update lead');
    }
  };

  return (
    <div className={styles.chatInfoContainer}>
      {/* Contact Header */}
      <div className={styles.contactHeader}>
        <Avatar size={40}>{contact.name?.[0] || 'D'}</Avatar>
        <div className={styles.contactName}>
          <Text strong>{contact.name || 'dilkumars918'}</Text>
          {contact.whatsapp && <WhatsAppOutlined className={styles.whatsappIcon} />}
        </div>
      </div>

      {/* Phone Number */}
      <div className={styles.infoSection}>
        <Text type="secondary">Phone Number</Text>
        <Input 
          value={contact.phone}
          placeholder="Enter phone number"
          className={styles.input}
        />
      </div>

      {/* Email */}
      <div className={styles.infoSection}>
        <Text type="secondary">Email</Text>
        <Input 
          value={contact.email}
          placeholder="Enter email"
          className={styles.input}
        />
      </div>

      {/* Follow Date/Time */}
      <div className={styles.infoSection}>
        <Text type="secondary">Follow Date/Time</Text>
        <div className={styles.dateTimeContainer}>
          <DatePicker 
            className={styles.datePicker}
            format="DD/MM/YYYY"
            value={contact.followDate ? dayjs(contact.followDate) : null}
          />
          <TimePicker 
            className={styles.timePicker}
            format="hh:mm A"
            use12Hours
            value={contact.followTime ? dayjs(contact.followTime) : null}
          />
        </div>
      </div>

      {/* Lead Info */}
      <div className={styles.sectionHeader}>
        <Title level={5}>Lead Info</Title>
      </div>

      {/* Product Dropdown */}
      <div className={styles.infoSection}>
        <Text type="secondary">Product</Text>
        <Select
          placeholder="Select Product"
          className={styles.select}
          value={contact.productId}
        >
          {products.map(product => (
            <Option key={product.id} value={product.id}>
              {product.product_name || product.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Stage Dropdown */}
      <div className={styles.infoSection}>
        <Text type="secondary">Stage</Text>
        <Select
          placeholder="Select Stage"
          className={styles.select}
          value={contact.stageId}
        >
          {stages.map(stage => (
            <Option key={stage.id} value={stage.id}>
              {stage.stage_name || stage.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Lead Source Dropdown */}
      <div className={styles.infoSection}>
        <Text type="secondary">Lead Source</Text>
        <Select
          placeholder="Select Lead Source"
          className={styles.select}
          value={contact.leadSourceId}
        >
          {leadSources.map(source => (
            <Option key={source.id} value={source.id}>
              {source.lead_source_name || source.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Status Toggle */}
      <div className={styles.infoSection}>
        <Text type="secondary">Status</Text>
        <div className={styles.statusToggle}>
          <Switch
            checked={isActive}
            onChange={setIsActive}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            style={{ backgroundColor: isActive ? theme.colors.primary : undefined }}
          />
        </div>
      </div>

      {/* Update Button */}
      <Button 
        type="primary" 
        size="small"
        onClick={handleUpdate}
        className={styles.updateButton}
        style={{ backgroundColor: theme.colors.primary }}
      >
        Update Lead
      </Button>
    </div>
  );
};

export default ChatInfo; 