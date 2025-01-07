import { Table, Tabs, Button, Modal, Form, Input, Select, Switch, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import theme from '../theme';
import ActionDropdown from '../components/ActionDropdown';
import { supabase } from '../lib/supabaseClient';
import UniversalTable from '../components/UniversalTable';
import LoadingSpinner from '../components/LoadingSpinner';
import debounce from 'lodash/debounce';

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          roles (
            role_name
          )
        `, { count: 'exact' })
        .eq('user_is_active', true);

      // Add search functionality
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setUsers(data);
      setTotalUsers(count);
    } catch (error) {
      message.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('role_is_active', true)
        .order('role_name', { ascending: true });

      if (error) throw error;
      setRoles(data);
    } catch (error) {
      message.error('Error fetching roles: ' + error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role_id: record.role_id,
      user_is_active: record.user_is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Error deleting user: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        const updates = {
          name: values.name,
          email: values.email,
          role_id: values.role_id,
          user_is_active: values.user_is_active,
        };

        // Only update password if it's changed
        if (values.password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(values.password, salt);
          updates.password = hashedPassword;
        }

        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) throw error;
        message.success('User updated successfully');
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(values.password, salt);

        const { error } = await supabase
          .from('users')
          .insert([{
            name: values.name,
            email: values.email,
            password: hashedPassword,
            role_id: values.role_id,
            user_is_active: values.user_is_active,
            email_verified: false,
            email_verified_at: null,
            activated_at: new Date().toISOString(),
            inactivated_at: null
          }]);

        if (error) throw error;
        message.success('User created successfully');
      }

      handleCancel();
      fetchUsers();
    } catch (error) {
      message.error(`Error ${editingUser ? 'updating' : 'creating'} user: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          roles (
            role_name
          )
        `, { count: 'exact' })
        .eq('user_is_active', true);

      if (value) {
        query = query.or(`name.ilike.%${value}%,email.ilike.%${value}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setUsers(data);
      setTotalUsers(count);
    } catch (error) {
      message.error('Error searching users: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2" key={record.id}>
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
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ROLE',
      dataIndex: 'roles',
      key: 'role',
      render: (roles, record) => roles?.role_name
    },
    {
      title: 'STATUS',
      dataIndex: 'user_is_active',
      key: 'status',
      render: (isActive, record) => (
        <span 
          key={record.id}
          className={`px-2 py-1 rounded-full ${
            isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          } text-sm`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <ActionDropdown 
          key={record.id}
          onEdit={() => handleEdit(record)}
          onDelete={() => {
            Modal.confirm({
              title: 'Delete User',
              content: `Are you sure you want to delete ${record.name}?`,
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

  const data = [
    {
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'Active',
    },
  ];

  const items = [
    {
      key: 'users',
      label: `Users (${userCount})`,
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
      label: 'Roles',
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

  // Get active key based on current path
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/admin/users') return 'users';
    return path.split('/').pop();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users, Teams & Roles</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add User
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
        dataSource={users}
        loading={loading}
        totalItems={totalUsers}
        onSearch={handleSearch}
        searchPlaceholder="Search users by name or email..."
      />

      {/* Add User Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
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
            user_is_active: true
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please enter user name',
              }
            ]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: 'Please enter email',
              },
              {
                type: 'email',
                message: 'Please enter a valid email',
              }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: !editingUser,
                message: 'Please enter password',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters',
              }
            ]}
          >
            <Input.Password 
              placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"} 
            />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Role"
            rules={[
              {
                required: true,
                message: 'Please select a role',
              }
            ]}
          >
            <Select placeholder="Select role">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.role_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="user_is_active"
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
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
