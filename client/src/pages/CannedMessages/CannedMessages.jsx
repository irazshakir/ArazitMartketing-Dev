import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Dropdown, 
  Menu,
  Modal,
  Form,
  Input,
  message,
  Layout 
} from 'antd';
import { 
  PlusOutlined,
  MoreOutlined 
} from '@ant-design/icons';
import theme from '../../theme';
import TableSkeleton from '../../components/TableSkeleton';
import { supabase } from '../../lib/supabaseClient';

const { Title } = Typography;
const { TextArea } = Input;

const CannedMessages = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMessage, setEditingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch messages with search
  const fetchMessages = async (searchTerm = '') => {
    try {
      setLoading(true);
      let query = supabase
        .from('canned_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      message.error('Failed to fetch messages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
    fetchMessages(value);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      if (editingMessage) {
        // Update existing message
        const { error } = await supabase
          .from('canned_messages')
          .update({
            title: values.title,
            message: values.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMessage.id);

        if (error) throw error;
        message.success('Message updated successfully');
      } else {
        // Add new message
        const { error } = await supabase
          .from('canned_messages')
          .insert([{
            title: values.title,
            message: values.message,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        message.success('Message added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingMessage(null);
      fetchMessages();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('canned_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      message.error('Delete failed: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="edit" 
                onClick={() => {
                  setEditingMessage(record);
                  form.setFieldsValue(record);
                  setIsModalVisible(true);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item 
                key="delete" 
                danger 
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{ padding: '4px 8px' }}
          />
        </Dropdown>
      ),
    },
  ];

  const headerStyle = {
    padding: '16px 24px',
    background: '#fff',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0
  };

  return (
    <Layout style={{ margin: 0, padding: 0 }}>
      <div style={{ 
        background: '#fff', 
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100%'
      }}>
        {/* Header Section */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Canned Messages</Title>
            <Input.Search
              placeholder="Search messages..."
              allowClear
              style={{ width: 250 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
              onSearch={handleSearch}
            />
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setEditingMessage(null);
              form.resetFields();
            }}
            style={{ background: theme.colors.primary }}
          >
            Add Message
          </Button>
        </div>

        {/* Table Section */}
        <div style={{ 
          padding: '24px',
          margin: 0
        }}>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table
              columns={columns}
              dataSource={messages}
              rowKey="id"
              pagination={{
                total: messages.length,
                showTotal: (total) => `Total ${total} items`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              style={{ margin: 0 }}
            />
          )}
        </div>

        {/* Add/Edit Message Modal */}
        <Modal
          title={editingMessage ? 'Edit Message' : 'Add Message'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingMessage(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddEdit}
            style={{ padding: '20px 0' }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input title!' }]}
            >
              <Input placeholder="Enter message title" />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please input message!' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Enter your message content"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ background: theme.colors.primary }}
                >
                  {editingMessage ? 'Update' : 'Submit'}
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingMessage(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CannedMessages;
