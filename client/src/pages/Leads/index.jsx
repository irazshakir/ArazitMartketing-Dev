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
  Select,
  Switch,
  message 
} from 'antd';
import { 
  FilterOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  PlusOutlined,
  MoreOutlined 
} from '@ant-design/icons';
import theme from '../../theme';
import axios from 'axios';
import TableSkeleton from '../../components/TableSkeleton';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;

axios.defaults.baseURL = 'http://localhost:5000'; // Your backend URL

const Leads = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // State for dropdown data
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [productsRes, stagesRes, sourcesRes, usersRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/stages'),
          axios.get('/api/lead-sources'),
          axios.get('/api/users')
        ]);

        setProducts(productsRes.data || []);
        setStages(stagesRes.data || []);
        setLeadSources(sourcesRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        message.error('Failed to fetch dropdown data');
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/leads');
      setLeads(response.data);
    } catch (error) {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddEdit = async (values) => {
    try {
      // Format the date and prepare values
      const formattedValues = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        lead_product: values.lead_product,
        lead_stage: values.lead_stage,
        lead_source_id: values.lead_source_id,
        assigned_user: values.assigned_user,
        initial_remarks: values.initial_remarks,
        lead_active_status: values.lead_active_status,
        fu_date: values.fu_date ? new Date(values.fu_date).toISOString().split('T')[0] : null
      };

      console.log('Original values:', values);
      console.log('Formatted values:', formattedValues);
      console.log('Editing lead ID:', editingLead?.id);

      if (editingLead) {
        const response = await axios.put(`/api/leads/${editingLead.id}`, formattedValues);
        console.log('Update response:', response.data);
        message.success('Lead updated successfully');
      } else {
        const response = await axios.post('/api/leads', formattedValues);
        console.log('Create response:', response.data);
        message.success('Lead added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Operation failed:', error);
      console.error('Error details:', error.response?.data);
      message.error('Operation failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // When opening the edit modal, format the date for the form
  const handleEdit = (record) => {
    console.log('Original record:', record);
    
    const formData = {
      name: record.name,
      email: record.email,
      phone: record.phone,
      lead_product: record.lead_product,
      lead_stage: record.lead_stage,
      lead_source_id: record.lead_source_id,
      assigned_user: record.assigned_user,
      initial_remarks: record.initial_remarks,
      lead_active_status: record.lead_active_status,
      fu_date: record.fu_date ? record.fu_date.split('T')[0] : null
    };
    
    console.log('Formatted form data:', formData);
    setEditingLead(record);
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/leads/${id}`);
      message.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Product',
      dataIndex: ['products', 'product_name'],
      key: 'product',
    },
    {
      title: 'Stage',
      dataIndex: ['stages', 'stage_name'],
      key: 'stage',
    },
    {
      title: 'Assigned To',
      dataIndex: ['users', 'name'],
      key: 'assigned_user',
    },
    {
      title: 'Status',
      dataIndex: 'lead_active_status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status ? '#52c41a' : '#ff4d4f',
          fontWeight: '500'
        }}>
          {status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Followup Date',
      dataIndex: 'fu_date',
      key: 'followup',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
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
                key="view" 
                onClick={() => navigate(`/admin/leads/${record.id}`)}
              >
                View & Edit
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
  };

  const actionButtonStyle = {
    display: 'flex',
    gap: '8px',
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={headerStyle}>
        <Title level={4} style={{ margin: 0 }}>Leads</Title>
        <div style={actionButtonStyle}>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<ImportOutlined />}>Import</Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setEditingLead(null);
              form.resetFields();
            }}
            style={{ background: theme.colors.primary }}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ padding: '24px' }}>
        {loading ? (
          <TableSkeleton />
        ) : (
          <Table
            columns={columns}
            dataSource={leads}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            rowKey="id"
            pagination={{
              total: leads.length,
              showTotal: (total) => `Total ${total} items`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        )}
      </div>

      {/* Add/Edit Lead Modal */}
      <Modal
        title={editingLead ? 'Edit Lead' : 'Add Lead'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingLead(null);
          form.resetFields();
        }}
        footer={null}
        width={720}
        bodyStyle={{ 
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
          initialValues={{ lead_active_status: true }}
          style={{ padding: '20px 0' }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please input valid email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input phone!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lead_product"
            label="Product"
            rules={[{ required: true, message: 'Please select product!' }]}
          >
            <Select>
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.product_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lead_stage"
            label="Stage"
            rules={[{ required: true, message: 'Please select stage!' }]}
          >
            <Select>
              {stages.map(stage => (
                <Select.Option key={stage.id} value={stage.id}>
                  {stage.stage_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lead_source_id"
            label="Lead Source"
            rules={[{ required: true, message: 'Please select lead source!' }]}
          >
            <Select>
              {leadSources.map(source => (
                <Select.Option key={source.id} value={source.id}>
                  {source.lead_source_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned_user"
            label="Lead Assigned"
            rules={[{ required: true, message: 'Please select user!' }]}
          >
            <Select>
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fu_date"
            label="Followup Date"
            rules={[{ required: true, message: 'Please select followup date!' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="initial_remarks"
            label="Note"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="lead_active_status"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </Form.Item>

          

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: theme.colors.primary }}>
                {editingLead ? 'Update' : 'Submit'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingLead(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Leads; 