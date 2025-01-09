import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ChatBox from '../../components/ChatBox/ChatBox';
import ChatInfo from '../../components/ChatInfo/ChatInfo';
import axios from 'axios';

const { Content, Sider } = Layout;
const { Title } = Typography;

const LeadEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.get(`/api/leads/${id}`);
        setLead(response.data);
      } catch (error) {
        message.error('Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleSendMessage = (message) => {
    // Implement message sending logic here
    console.log('Sending message:', message);
  };

  const handleAddTag = () => {
    // Implement tag adding logic here
  };

  const handleLinkCompany = () => {
    // Implement company linking logic here
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        />
        <Title level={4} style={{ margin: 0 }}>
          Lead Details
        </Title>
      </div>

      {/* Main Content */}
      <Layout style={{ background: '#fff' }}>
        <Content style={{ height: 'calc(100vh - 65px)' }}>
          <ChatBox onSendMessage={handleSendMessage} />
        </Content>
        
        <Sider 
          width={350} 
          style={{ 
            background: '#fff',
            borderLeft: '1px solid #f0f0f0',
            overflow: 'auto'
          }}
        >
          <ChatInfo
            contact={{
              name: lead?.name,
              phone: lead?.phone,
              email: lead?.email,
              whatsapp: true,
              marketingOptIn: 'Yes',
              source: lead?.lead_sources?.lead_source_name,
              sourceId: lead?.id,
              // Add other relevant lead data here
            }}
            onAddTag={handleAddTag}
            onLinkCompany={handleLinkCompany}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default LeadEdit;
