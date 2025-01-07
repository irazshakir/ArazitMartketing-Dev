import { Tabs, Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import theme from '../../theme';
import ActionDropdown from '../../components/ActionDropdown';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';

function Roles() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [totalRoles, setTotalRoles] = useState(0);
  const [roleCount, setRoleCount] = useState(0);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('roles')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('role_name', `%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setRoles(data);
      setTotalRoles(count);
      setRoleCount(count);
    } catch (error) {
      message.error('Error fetching roles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const showModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({
        role_name: role.role_name,
        role_is_active: role.role_is_active
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update({
            role_name: values.role_name,
            role_is_active: values.role_is_active
          })
          .eq('id', editingRole.id);

        if (error) throw error;
        message.success('Role updated successfully');
      } else {
        // Create new role
        const { error } = await supabase
          .from('roles')
          .insert([{
            role_name: values.role_name,
            role_is_active: values.role_is_active
          }]);

        if (error) throw error;
        message.success('Role added successfully');
      }
      
      handleCancel();
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      message.error(`Error ${editingRole ? 'updating' : 'adding'} role: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (error) throw error;
      message.success('Role deleted successfully');
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      message.error('Error deleting role: ' + error.message);
    }
  };

  const items = [
    {
      key: 'users',
      label: (
        <span>
          Users <span className="text-xs ml-1 text-gray-500">6/6</span>
        </span>
      ),
    },
    {
      key: 'invites',
      label: (
        <span>
          Invites <span className="text-xs ml-1 text-gray-500">0</span>
        </span>
      ),
    },
    {
      key: 'inactive',
      label: 'Inactive Users',
    },
    {
      key: 'teams',
      label: 'Teams',
    },
    {
      key: 'roles',
      label: `Roles (${roleCount})`, // Dynamic count
    },
  ];

  const handleTabChange = (key) => {
    switch(key) {
        case 'users':
          navigate('/admin/users');
          break;
        case 'invites':
          navigate('/admin/users/invites');
          break;
        case 'inactive':
          navigate('/admin/users/inactive');
          break;
        case 'teams':
          navigate('/admin/users/teams');
          break;
        case 'roles':
          navigate('/admin/users/roles');
          break;
      }
  };

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/users') return 'users';
    return path.split('/').pop();
  };

  const columns = [
    {
      title: 'ROLE NAME',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-sm font-medium text-pink-600">
              {text.charAt(0)}
            </span>
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'role_is_active',
      key: 'role_is_active',
      render: (isActive) => (
        <span className={`px-2 py-1 rounded-full ${
          isActive 
            ? 'bg-green-50 text-green-600' 
            : 'bg-red-50 text-red-600'
        } text-sm`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => showModal(record)}
          onDelete={() => {
            Modal.confirm({
              title: 'Delete Role',
              content: `Are you sure you want to delete the role "${record.role_name}"?`,
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users, Teams & Roles</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add Role
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
        dataSource={roles}
        loading={loading}
        totalItems={totalRoles}
        onSearch={fetchRoles}
        searchPlaceholder="Search roles..."
      />

      {/* Add/Edit Role Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Add New Role"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role_is_active: true
          }}
        >
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[
              {
                required: true,
                message: 'Please enter role name',
              },
              {
                min: 3,
                message: 'Role name must be at least 3 characters',
              }
            ]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Form.Item
            name="role_is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
              defaultChecked
              style={{
                backgroundColor: '#52c41a',
                '&.ant-switch-checked': {
                  backgroundColor: '#52c41a',
                },
                '&.ant-switch-unchecked': {
                  backgroundColor: '#d9d9d9',
                }
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
              {editingRole ? 'Update Role' : 'Add Role'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Roles;