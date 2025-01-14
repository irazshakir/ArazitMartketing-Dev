import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  message, 
  Space, 
  Typography, 
  Tabs 
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';

const { Title } = Typography;

const CompanyBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [editingBranch, setEditingBranch] = useState(null);

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/branches');
      setBranches(response.data);
    } catch (error) {
      message.error('Failed to fetch branches');
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      await axios.post('/api/branches', values);
      message.success('Branch added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchBranches();
    } catch (error) {
      message.error('Failed to add branch');
      console.error('Error adding branch:', error);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'NAME',
      dataIndex: 'branch_name',
      key: 'branch_name',
      align: 'left',
      render: (text) => (
        <span className="font-normal">{text}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'branch_is_active',
      key: 'branch_is_active',
      align: 'center',
      render: (active) => (
        <span className={`${active ? 'text-green-600' : 'text-red-600'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => handleEdit(record)}
          onDelete={() => {
            Modal.confirm({
              title: 'Delete Branch',
              content: `Are you sure you want to delete ${record.branch_name}?`,
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => handleDelete(record)
            });
          }}
        />
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingBranch(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('company_branches')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      message.success('Branch deleted successfully');
      fetchBranches();
    } catch (error) {
      message.error('Error deleting branch');
    }
  };

  // Navigation tabs configuration
  const items = [
    {
      key: 'general',
      label: 'General',
    },
    {
      key: 'products',
      label: 'Products',
    },
    {
      key: 'stages',
      label: 'Stages',
    },
    {
      key: 'lead-sources',
      label: 'Lead Sources',
    },
    {
      key: 'company-branches',
      label: 'Company Branches',
    },
  ];

  const handleTabChange = (key) => {
    switch(key) {
      case 'general':
        navigate('/admin/settings/general');
        break;
      case 'products':
        navigate('/admin/settings/products');
        break;
      case 'stages':
        navigate('/admin/settings/stages');
        break;
      case 'lead-sources':
        navigate('/admin/settings/lead-sources');
        break;
      case 'company-branches':
        navigate('/admin/settings/company-branches');
        break;
    }
  };

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/admin/settings') return 'general';
    return path.split('/').pop();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add Branch
        </Button>
      </div>

      <Tabs 
        items={items} 
        activeKey={getActiveKey()}
        onChange={handleTabChange}
        className="custom-tabs"
      />

      <UniversalTable 
        columns={columns}
        dataSource={branches}
        loading={loading}
        totalItems={branches.length}
        onSearch={fetchBranches}
        searchPlaceholder="Search branches..."
        className="settings-table"
      />

      <Modal
        title={editingBranch ? "Edit Branch" : "Add New Branch"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingBranch(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ branch_is_active: true }}
        >
          <Form.Item
            name="branch_name"
            label="Branch Name"
            rules={[
              { required: true, message: 'Please enter branch name' },
              { max: 255, message: 'Branch name too long' }
            ]}
          >
            <Input placeholder="Enter branch name" />
          </Form.Item>

          <Form.Item
            name="branch_is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
              defaultChecked
              style={{
                backgroundColor: '#d9d9d9',
                '&.ant-switch-checked': {
                  backgroundColor: '#52c41a',
                },
              }}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
              setEditingBranch(null);
            }}>
              Cancel
            </Button>
            <Button 
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ 
                backgroundColor: '#aa2478',
                borderColor: '#aa2478'
              }}
            >
              {editingBranch ? 'Update Branch' : 'Add Branch'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyBranches;
