import { Typography, Row, Col, Card, Button, Select, DatePicker } from 'antd';
import {
  ClockCircleOutlined,
  UserAddOutlined,
  TeamOutlined,
  PhoneOutlined,
  ProjectOutlined,
  FieldTimeOutlined,
  FireOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import DashboardCard from '../../components/DashboardCard';
import { Area } from '@ant-design/charts';
import './styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Column } from '@ant-design/plots';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [dashboardStats, setDashboardStats] = useState({
    todayLeads: 0,
    newCustomers: 0,
    todayFollowups: 0,
    hotLeads: 0,
    activeLeads: 0,
    hotActiveLeads: 0,
    salesLeads: 0,
    totalPeriodLeads: 0,
    periodStart: '',
    periodEnd: ''
  });

  // Fetch branches and initial stats on component mount
  useEffect(() => {
    fetchBranches();
    fetchDashboardStats();
  }, []);

  // Fetch stats when branch or date range changes
  useEffect(() => {
    fetchDashboardStats();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/branches');
      
      const branchData = response.data?.data || [];
      
      const branchOptions = [
        { value: 'all', label: 'All Branches' },
        ...branchData.map(branch => ({
          value: branch.id,
          label: branch.branch_name
        }))
      ];
      
      setBranches(branchOptions);
    } catch (error) {
      setBranches([{ value: 'all', label: 'All Branches' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (options = {}) => {
    try {
      setLoading(true);
      const { startDate, endDate, timeRange } = options;
      
      const params = {
        branchId: selectedBranch,
        timeRange: timeRange || selectedTimeRange
      };

      // Only add date parameters if they exist
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get('/api/dashboard/stats', { params });

      if (response.data?.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      setDashboardStats({
        todayLeads: 0,
        newCustomers: 0,
        todayFollowups: 0,
        hotLeads: 0,
        activeLeads: 0,
        hotActiveLeads: 0,
        salesLeads: 0,
        totalPeriodLeads: 0,
        periodStart: '',
        periodEnd: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    // You can add additional logic here to refresh dashboard data based on selected branch
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      fetchDashboardStats(); // Reset to default stats
      return;
    }

    const [start, end] = dates;
    const startDate = start.format('YYYY-MM-DD');
    const endDate = end.format('YYYY-MM-DD');

    fetchDashboardStats({
      startDate,
      endDate
    });
  };

  const handleTimeRangeChange = (value) => {
    setSelectedTimeRange(value);
    fetchDashboardStats({ timeRange: value });
  };

  const cardData = [
    { 
      icon: <ClockCircleOutlined style={{ color: '#FF9F43' }} />, 
      count: dashboardStats.todayLeads, 
      title: "Today's Leads" 
    },
    { 
      icon: <UserAddOutlined style={{ color: '#28C76F' }} />, 
      count: dashboardStats.newCustomers, 
      title: "New Customers Added" 
    },
    { 
      icon: <PhoneOutlined style={{ color: '#EA5455' }} />, 
      count: dashboardStats.todayFollowups, 
      title: "Today's Followups" 
    },
    { 
      icon: <FireOutlined style={{ color: '#FF4D4F' }} />, 
      count: dashboardStats.hotLeads, 
      title: "Hot Stage Leads" 
    },
  ];

  // Sample data for the chart
  const chartData = {
    data: [
      { day: 'Mo', value: 3 },
      { day: 'Tu', value: 4 },
      { day: 'We', value: 3.5 },
      { day: 'Th', value: 5 },
      { day: 'Fr', value: 4.9 },
      { day: 'Sa', value: 6 },
      { day: 'Su', value: 7 },
    ],
    xField: 'day',
    yField: 'value',
    smooth: true,
  };

  // Chart Configuration
  const leadsVsDealsConfig = {
    data: dashboardStats.leadsVsClosedStats?.chartData || [],
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ['#28c76f', '#ff5d5f'],
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        style: {
          fill: '#909399',
          fontSize: 12,
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#909399',
          fontSize: 12,
        },
      },
    },
    legend: {
      position: 'top-right',
      itemName: {
        style: {
          fill: '#5B5C61',
        },
      },
    },
    tooltip: {
      shared: true,
      showMarkers: false,
    },
    interactions: [
      {
        type: 'active-region',
        enable: true,
      },
    ],
  };

  const timeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'previousMonth', label: 'Previous Month' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  return (
    <div className="dashboard-container">
      <Title level={2}>Admin Dashboard</Title>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            defaultValue="all"
            value={selectedBranch}
            onChange={handleBranchChange}
            style={{ width: 200 }}
            options={branches}
            loading={loading}
            placeholder="Select Branch"
          />
        </div>
        <div className="filter-group">
          <RangePicker 
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {cardData.map((card, index) => (
          <Col xs={24} sm={12} md={12} lg={6} xl={6} key={index}>
            <Card className="stat-card">
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-content">
                <h1 className="stat-count">{card.count}</h1>
                <p className="stat-title">{card.title}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card className="achievement-card">
            <div className="achievement-content">
              <div className="achievement-main">
                <h1 className="achievement-number">{calculateConversionRatio(dashboardStats.salesLeads, dashboardStats.totalPeriodLeads)}%</h1>
                <p className="achievement-text">Conversion Ratio</p>
              </div>

              <div className="achievement-stats">
                <div className="stat-item">
                  <CheckCircleOutlined className="stat-icon active" />
                  <div className="stat-info">
                    <span className="stat-value">{dashboardStats.activeLeads}</span>
                    <span className="stat-label">Active Leads</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FireOutlined className="stat-icon hot" />
                  <div className="stat-info">
                    <span className="stat-value">{dashboardStats.hotActiveLeads}</span>
                    <span className="stat-label">Hot Leads</span>
                  </div>
                </div>
                <div className="stat-item">
                  <DollarCircleOutlined className="stat-icon sales" />
                  <div className="stat-info">
                    <span className="stat-value">{dashboardStats.salesLeads}</span>
                    <span className="stat-label">Sales Leads</span>
                  </div>
                </div>
              </div>

              <div className="conversion-ratio">
                <h3>Conversion Ratio</h3>
                <span className="ratio-value">
                  {calculateConversionRatio(dashboardStats.salesLeads, dashboardStats.totalPeriodLeads)}%
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card">
            <div className="chart-summary">
              <div className="summary-item">
                <Typography.Text type="secondary">Total Leads Created</Typography.Text>
                <Typography.Title level={3}>
                  {dashboardStats.leadsVsClosedStats?.summary.totalCreated || 0}
                </Typography.Title>
              </div>
              <div className="summary-item">
                <Typography.Text type="secondary">Total Leads Closed</Typography.Text>
                <Typography.Title level={3}>
                  {dashboardStats.leadsVsClosedStats?.summary.totalClosed || 0}
                </Typography.Title>
              </div>
            </div>
            
            <Column {...leadsVsDealsConfig} height={300} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Helper function to calculate conversion ratio
const calculateConversionRatio = (salesLeads, totalLeads) => {
  if (!totalLeads) return 0;
  return Math.round((salesLeads / totalLeads) * 100);
};

export default AdminDashboard; 