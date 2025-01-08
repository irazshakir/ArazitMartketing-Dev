import { Typography, Tabs, Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';

const { Title } = Typography;

const Stages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [form] = Form.useForm();
  const [totalStages, setTotalStages] = useState(0);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('stages')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('stage_name', `%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setStages(data);
      setTotalStages(count);
    } catch (error) {
      message.error('Error fetching stages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingStage) {
        const { error } = await supabase
          .from('stages')
          .update(values)
          .eq('id', editingStage.id);

        if (error) throw error;
        message.success('Stage updated successfully');
      } else {
        const { error } = await supabase
          .from('stages')
          .insert([values]);

        if (error) throw error;
        message.success('Stage created successfully');
      }

      handleCancel();
      fetchStages();
    } catch (error) {
      message.error(`Error ${editingStage ? 'updating' : 'creating'} stage`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingStage(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      message.success('Stage deleted successfully');
      fetchStages();
    } catch (error) {
      message.error('Error deleting stage');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingStage(null);
  };

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'stage_name',
      key: 'stage_name',
      align: 'left',
      render: (text) => (
        <span className="font-normal">{text}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'stage_is_active',
      key: 'stage_is_active',
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
              title: 'Delete Stage',
              content: `Are you sure you want to delete ${record.stage_name}?`,
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
          onClick={() => setIsModalOpen(true)}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add Stage
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
        dataSource={stages}
        loading={loading}
        totalItems={totalStages}
        onSearch={fetchStages}
        searchPlaceholder="Search stages..."
        className="settings-table"
      />

      <Modal
        title={editingStage ? "Edit Stage" : "Add New Stage"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ stage_is_active: true }}
        >
          <Form.Item
            name="stage_name"
            label="Stage Name"
            rules={[{ required: true, message: 'Please enter stage name' }]}
          >
            <Input placeholder="Enter stage name" />
          </Form.Item>

          <Form.Item
            name="stage_is_active"
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
              {editingStage ? 'Update Stage' : 'Add Stage'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Stages; 