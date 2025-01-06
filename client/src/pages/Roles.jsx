import { Table, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import theme from '../theme';
import ActionDropdown from '../components/ActionDropdown';

function Roles() {
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
      title: 'ROLE NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">
              {text.charAt(0)}
            </span>
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'MEMBERS',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-sm">
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
      name: 'Admin',
      description: 'Full system access',
      members: '2 members',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Editor',
      description: 'Content management access',
      members: '4 members',
      status: 'Active',
    },
    {
      key: '3',
      name: 'Viewer',
      description: 'Read-only access',
      members: '8 members',
      status: 'Active',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users, Teams & Roles</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
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
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
}

export default Roles;