import { Tabs, Button, Modal, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import theme from '../../theme';
import ActionDropdown from '../../components/ActionDropdown';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';

const InactiveUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalInactiveUsers, setTotalInactiveUsers] = useState(0);
  const [inactiveUserCount, setInactiveUserCount] = useState(0);

  const fetchInactiveUsers = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*, roles (role_name)', { count: 'exact' })
        .eq('user_is_active', false);

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setInactiveUsers(data);
      setTotalInactiveUsers(count);
      setInactiveUserCount(count);
    } catch (error) {
      message.error('Error fetching inactive users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    // Navigate to main Users page with the user data for editing
    navigate('/admin/users', { state: { editUser: record } });
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      message.success('User deleted successfully');
      fetchInactiveUsers();
    } catch (error) {
      message.error('Error deleting user: ' + error.message);
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
      render: (roles) => roles?.role_name
    },
    {
      title: 'STATUS',
      dataIndex: 'user_is_active',
      key: 'status',
      render: () => (
        <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-sm">
          Inactive
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <ActionDropdown 
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

  const items = [
    {
      key: 'users',
      label: 'Users',
    },
    {
      key: 'invites',
      label: 'Invites',
    },
    {
      key: 'inactive',
      label: `Inactive Users (${inactiveUserCount})`,
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

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/admin/users') return 'users';
    return path.split('/').pop();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users, Teams & Roles</h1>
      </div>
      <Tabs 
        items={items} 
        activeKey={getActiveKey()}
        onChange={handleTabChange}
        className="custom-tabs"
      />
      <UniversalTable 
        columns={columns}
        dataSource={inactiveUsers}
        loading={loading}
        totalItems={totalInactiveUsers}
        onSearch={fetchInactiveUsers}
        searchPlaceholder="Search inactive users..."
      />
    </div>
  );
};

export default InactiveUsers;