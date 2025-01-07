import { Tabs, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import theme from '../../theme';
import ActionDropdown from '../../components/ActionDropdown';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';

function Teams() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalTeams, setTotalTeams] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('user_is_active', true);

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      message.error('Error fetching users: ' + error.message);
    }
  };

  const fetchTeams = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          team_manager (
            id,
            name,
            email
          )
        `, { count: 'exact' });

      if (search) {
        query = query.ilike('team_name', `%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Process the teams data to include member count
      const processedTeams = data.map(team => ({
        ...team,
        members_count: team.team_members ? JSON.parse(team.team_members).length : 0
      }));

      setTeams(processedTeams);
      setTotalTeams(count);
      setTeamCount(count);
    } catch (error) {
      message.error('Error fetching teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const teamData = {
        team_name: values.team_name,
        team_manager: values.team_manager,
        team_members: JSON.stringify(values.team_members || [])
      };

      if (editingTeam) {
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', editingTeam.id);

        if (error) throw error;
        message.success('Team updated successfully');
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([teamData]);

        if (error) throw error;
        message.success('Team created successfully');
      }

      handleCancel();
      fetchTeams();
    } catch (error) {
      message.error(`Error ${editingTeam ? 'updating' : 'creating'} team: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingTeam(record);
    form.setFieldsValue({
      team_name: record.team_name,
      team_manager: record.team_manager.id,
      team_members: JSON.parse(record.team_members)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      message.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      message.error('Error deleting team: ' + error.message);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const columns = [
    {
      title: 'TEAM NAME',
      dataIndex: 'team_name',
      key: 'team_name',
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
      title: 'MEMBERS',
      dataIndex: 'members_count',
      key: 'members',
      render: (count) => `${count} members`
    },
    {
      title: 'TEAM MANAGER',
      dataIndex: 'team_manager',
      key: 'team_manager',
      render: (manager) => manager?.name
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => handleEdit(record)}
          onDelete={() => {
            Modal.confirm({
              title: 'Delete Team',
              content: `Are you sure you want to delete ${record.team_name}?`,
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
      label: `Teams (${teamCount})`, // Dynamic count
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
    if (path === '/users') return 'users';
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
          Add Team
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
        dataSource={teams}
        loading={loading}
        totalItems={totalTeams}
        onSearch={fetchTeams}
        searchPlaceholder="Search teams..."
      />

      <Modal
        title={editingTeam ? "Edit Team" : "Create New Team"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ team_members: [] }}
        >
          <Form.Item
            name="team_name"
            label="Team Name"
            rules={[{ required: true, message: 'Please enter team name' }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>

          <Form.Item
            name="team_manager"
            label="Team Manager"
            rules={[{ required: true, message: 'Please select team manager' }]}
          >
            <Select
              placeholder="Select team manager"
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="team_members"
            label="Team Members"
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Select.Option>
              ))}
            </Select>
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
              {editingTeam ? 'Update Team' : 'Create Team'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Teams;