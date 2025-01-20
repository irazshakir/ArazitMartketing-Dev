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
  Tag,
  Drawer,
  Select,
  DatePicker
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    lead_product: null,
    lead_stage: null,
    lead_active_status: null,
    lead_source_id: null,
    fu_date: null
  });
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [leadSources, setLeadSources] = useState([]);

  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const followupDate = record.fu_date ? new Date(record.fu_date) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return (
          <Space>
            {text}
            {followupDate && followupDate < today && record.lead_active_status && (
              <Tag color="error" style={{ marginLeft: 8 }}>
                Alert !
              </Tag>
            )}
          </Space>
        );
      },
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

  // Add useEffect to fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [productsRes, stagesRes, sourcesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/stages'),
          axios.get('/api/lead-sources')
        ]);

        setProducts(productsRes.data || []);
        setStages(stagesRes.data || []);
        setLeadSources(sourcesRes.data || []);
      } catch (error) {
        message.error('Failed to fetch filter options');
      }
    };

    fetchFilterOptions();
  }, []);

  // Add filter handling functions
  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('user_jwt');
      const queryParams = new URLSearchParams();
      
      // Add all non-null filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/user-leads?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (error) {
      message.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      lead_product: null,
      lead_stage: null,
      lead_active_status: null,
      lead_source_id: null,
      fu_date: null
    });
    fetchUserLeads();
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
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filter
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

      {/* Add Filter Drawer */}
      <Drawer
        title="Filter Leads"
        placement="right"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        width={400}
        extra={
          <Space>
            <Button onClick={resetFilters}>Reset</Button>
            <Button 
              type="primary" 
              onClick={() => {
                handleFilterChange();
                setIsFilterDrawerOpen(false);
              }}
              style={{ background: theme.colors.primary }}
            >
              Apply
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Typography.Text strong>Product</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select Product"
              allowClear
              value={filters.lead_product}
              onChange={(value) => setFilters({ ...filters, lead_product: value })}
            >
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.product_name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <Typography.Text strong>Stage</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select Stage"
              allowClear
              value={filters.lead_stage}
              onChange={(value) => setFilters({ ...filters, lead_stage: value })}
            >
              {stages.map(stage => (
                <Select.Option key={stage.id} value={stage.id}>
                  {stage.stage_name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <Typography.Text strong>Status</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select Status"
              allowClear
              value={filters.lead_active_status}
              onChange={(value) => setFilters({ ...filters, lead_active_status: value })}
            >
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </div>

          <div>
            <Typography.Text strong>Lead Source</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Select Lead Source"
              allowClear
              value={filters.lead_source_id}
              onChange={(value) => setFilters({ ...filters, lead_source_id: value })}
            >
              {leadSources.map(source => (
                <Select.Option key={source.id} value={source.id}>
                  {source.lead_source_name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <Typography.Text strong>Followup Date</Typography.Text>
            <DatePicker
              style={{ width: '100%', marginTop: 8 }}
              onChange={(date) => setFilters({ ...filters, fu_date: date ? date.format('YYYY-MM-DD') : null })}
              allowClear
            />
          </div>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default UserLeadIndex; 