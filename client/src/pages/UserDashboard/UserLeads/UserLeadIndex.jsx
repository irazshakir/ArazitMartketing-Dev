import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Dropdown, 
  Menu,
  Input,
  message,
  Layout,
  Tag 
} from 'antd';
import { 
  FilterOutlined, 
  ExportOutlined, 
  MoreOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import TableSkeleton from '../../../components/TableSkeleton';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import theme from '../../../theme';
import moment from 'moment';

const { Title } = Typography;

// Debounced search function
const debouncedFetchLeads = debounce(async (value, callback) => {
  callback(value);
}, 500);

const UserLeadIndex = () => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Product',
      dataIndex: ['products', 'product_name'],
      key: 'product',
    },
    {
      title: 'Stage',
      dataIndex: ['stages', 'stage_name'],
      key: 'stage',
      render: (text, record) => (
        <Tag color={getStageColor(record.stages?.stage_name)}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'lead_active_status',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: ['lead_sources', 'lead_source_name'],
      key: 'source',
    },
    {
      title: 'Follow-up Date',
      dataIndex: 'fu_date',
      key: 'fu_date',
      render: (text) => text ? moment(text).format('DD MMM YYYY') : '-',
      sorter: (a, b) => {
        if (!a.fu_date) return 1;
        if (!b.fu_date) return -1;
        return moment(a.fu_date).unix() - moment(b.fu_date).unix();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" onClick={() => navigate(`/user/leads/${record.id}`)}>
                View Details
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Fetch leads for current user
  const fetchUserLeads = async (searchValue = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('user_jwt');
      const response = await axios.get(`/api/user-leads${searchValue ? `?search=${searchValue}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setLeads(response.data.data || []);
      } else {
        message.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLeads();
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    debouncedFetchLeads(value, fetchUserLeads);
  };

  // Updated helper function for stage colors
  const getStageColor = (stageName) => {
    const stageColors = {
      'New Lead': 'blue',
      'Contacted': 'orange',
      'Hot Lead': 'red',
      'Interested': 'purple',
      'Meeting Fixed': 'cyan',
      'Meeting Done': 'geekblue',
      'Quotation Sent': 'volcano',
      'Negotiation': 'magenta',
      'Won': 'green',
      'Lost': 'gray',
      'Not Interested': '#999999'
    };
    return stageColors[stageName] || 'default';
  };

  const headerStyle = {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
  };

  const actionButtonStyle = {
    display: 'flex',
    gap: '8px',
  };

  return (
    <Layout style={{ margin: 0, padding: 0 }}>
      <div style={{ 
        background: '#fff', 
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100%'
      }}>
        {/* Header Section */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>My Leads</Title>
            <Input.Search
              placeholder="Search leads..."
              allowClear
              style={{ width: 250 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
            />
          </div>
          <div style={actionButtonStyle}>
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button 
              icon={<ExportOutlined />}
              style={{ background: theme.colors.primary, color: '#fff' }}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ 
          padding: '24px',
          margin: 0
        }}>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table
              columns={columns}
              dataSource={leads}
              rowKey="id"
              pagination={{
                total: leads.length,
                showTotal: (total) => `Total ${total} leads`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              style={{ margin: 0 }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserLeadIndex; 