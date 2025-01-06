import { Table, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import theme from '../theme';
import ActionDropdown from '../components/ActionDropdown';

const InactiveUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      label: 'Roles',
    },
  ];

  const handleTabChange = (key) => {
    switch(key) {
      case 'users':
        navigate('/users');
        break;
      case 'invites':
        navigate('/users/invites');
        break;
      case 'inactive':
        navigate('/users/inactive');
        break;
      case 'teams':
        navigate('/users/teams');
        break;
      case 'roles':
        navigate('/users/roles');
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
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
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
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-sm">
          {text}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'Inactive',
    },
    {
      key: '2',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Editor',
      status: 'Inactive',
    },
  ];

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
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default InactiveUsers;