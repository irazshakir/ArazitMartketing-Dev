import { Typography, Tabs, Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';

const { Title } = Typography;

const LeadSources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leadSources, setLeadSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [form] = Form.useForm();
  const [totalSources, setTotalSources] = useState(0);

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'lead_source_name',
      key: 'lead_source_name',
      align: 'left',
      render: (text) => (
        <span className="font-normal">{text}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'lead_source_is_active',
      key: 'lead_source_is_active',
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
              title: 'Delete Lead Source',
              content: `Are you sure you want to delete ${record.lead_source_name}?`,
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

  const fetchLeadSources = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('lead_sources')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('lead_source_name', `%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setLeadSources(data);
      setTotalSources(count);
    } catch (error) {
      message.error('Error fetching lead sources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingSource) {
        const { error } = await supabase
          .from('lead_sources')
          .update(values)
          .eq('id', editingSource.id);

        if (error) throw error;
        message.success('Lead source updated successfully');
      } else {
        const { error } = await supabase
          .from('lead_sources')
          .insert([values]);

        if (error) throw error;
        message.success('Lead source created successfully');
      }

      handleCancel();
      fetchLeadSources();
    } catch (error) {
      message.error(`Error ${editingSource ? 'updating' : 'creating'} lead source`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingSource(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('lead_sources')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      message.success('Lead source deleted successfully');
      fetchLeadSources();
    } catch (error) {
      message.error('Error deleting lead source');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingSource(null);
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
    }
  };

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/admin/settings/general') return 'general';
    return path.split('/').pop();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add Lead Source
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
        dataSource={leadSources}
        loading={loading}
        totalItems={totalSources}
        onSearch={fetchLeadSources}
        searchPlaceholder="Search lead sources..."
        className="settings-table"
      />

      <Modal
        title={editingSource ? "Edit Lead Source" : "Add New Lead Source"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ lead_source_is_active: true }}
        >
          <Form.Item
            name="lead_source_name"
            label="Lead Source Name"
            rules={[{ required: true, message: 'Please enter lead source name' }]}
          >
            <Input placeholder="Enter lead source name" />
          </Form.Item>

          <Form.Item
            name="lead_source_is_active"
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
            <Button onClick={handleCancel}>
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
              {editingSource ? 'Update Lead Source' : 'Add Lead Source'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadSources; 