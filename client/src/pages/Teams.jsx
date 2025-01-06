import { Table, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import theme from '../theme';

function Teams() {
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
      title: 'TEAM NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {text.charAt(0)}
            </span>
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'MEMBERS',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: 'CREATED BY',
      dataIndex: 'createdBy',
      key: 'createdBy',
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
  ];

  const data = [
    {
      key: '1',
      name: 'Sales Team',
      members: '5 members',
      createdBy: 'Admin',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Marketing Team',
      members: '3 members',
      createdBy: 'Manager',
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
          Add Team
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

export default Teams;