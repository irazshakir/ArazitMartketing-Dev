import { Table, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import theme from '../theme';

const Users = () => {
  // Table columns configuration
  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
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
        <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-sm">
          {text}
        </span>
      ),
    },
    {
      title: '2FA',
      dataIndex: '2fa',
      key: '2fa',
      render: (text) => (
        <span className="text-gray-500 flex items-center gap-1">
          <span className="text-green-500">✓</span> {text}
        </span>
      ),
    },
  ];

  // Sample data
  const data = [
    {
      key: '1',
      name: 'Inzmam',
      email: 'inzamamulhaqoficial@gmail.com',
      role: 'Admin',
      status: 'Active',
      '2fa': 'Yet To Setup',
    },
    // Add more sample data as needed
  ];

  const items = [
    {
      key: 'users',
      label: (
        <span>
          Users <span className="text-xs ml-1 text-gray-500">6/6</span>
        </span>
      ),
      children: <Table columns={columns} dataSource={data} pagination={false} />,
    },
    {
      key: 'invites',
      label: (
        <span>
          Invites <span className="text-xs ml-1 text-gray-500">0</span>
        </span>
      ),
      children: <div>Invites content</div>,
    },
    {
      key: 'deleted',
      label: 'Deleted Users',
      children: <div>Deleted users content</div>,
    },
    {
      key: 'teams',
      label: 'Teams',
      children: <div>Teams content</div>,
    },
    {
      key: 'roles',
      label: 'Roles',
      children: <div>Roles content</div>,
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
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary 
          }}
        >
          Add User
        </Button>
      </div>
      <Tabs 
        items={items} 
        defaultActiveKey="users"
        style={{
          '.ant-tabs-ink-bar': {
            backgroundColor: theme.colors.primary
          }
        }}
      />
    </div>
  );
};

export default Users;
