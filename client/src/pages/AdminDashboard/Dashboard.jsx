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

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayLeads: 0,
    newCustomers: 0,
    todayFollowups: 0,
    hotLeads: 0
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
      
      console.log('Branch API Response:', response); // Debug log
      
      const branchData = response.data?.data || [];
      console.log('Branch Data:', branchData); // Debug log
      
      const branchOptions = [
        { value: 'all', label: 'All Branches' },
        ...branchData.map(branch => ({
          value: branch.id,
          label: branch.branch_name
        }))
      ];
      
      console.log('Branch Options:', branchOptions); // Debug log
      
      setBranches(branchOptions);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([{ value: 'all', label: 'All Branches' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (dateRange = {}) => {
    try {
      setLoading(true);
      const { startDate, endDate } = dateRange;
      
      console.log('Fetching stats with params:', {
        branchId: selectedBranch,
        startDate,
        endDate
      });

      const response = await axios.get('/api/dashboard/stats', {
        params: {
          branchId: selectedBranch,
          startDate,
          endDate
        }
      });

      if (response.data?.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setDashboardStats({
        todayLeads: 0,
        newCustomers: 0,
        todayFollowups: 0,
        hotLeads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    // You can add additional logic here to refresh dashboard data based on selected branch
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
          <RangePicker />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {cardData.map((card, index) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} key={index}>
            <DashboardCard {...card} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Sales Achievements" 
            extra={
              <div className="target-header">
                <span>for the</span>
                <Select
                  defaultValue="7days"
                  style={{ width: 160 }}
                  options={timeOptions}
                  bordered={false}
                  className="time-select"
                />
              </div>
            }
          >
            <div className="achievement-content">
              <div className="achievement-main">
                <h1 className="achievement-number">0</h1>
                <p className="achievement-text">achieved out of</p>
                <h2 className="achievement-target">0/-</h2>
              </div>

              <div className="achievement-stats">
                <div className="stat-item">
                  <CheckCircleOutlined className="stat-icon active" />
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Active Leads</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FireOutlined className="stat-icon hot" />
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Hot Leads</span>
                  </div>
                </div>
                <div className="stat-item">
                  <DollarCircleOutlined className="stat-icon sales" />
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Sales Leads</span>
                  </div>
                </div>
              </div>

              <div className="conversion-ratio">
                <h3>Conversion Ratio</h3>
                <span className="ratio-value">0%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Leads vs Deal/Opportunity">
            <Area {...chartData} />
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={8}>
                <p>Leads for the Month</p>
                <h2>0</h2>
              </Col>
              <Col span={8}>
                <p>Leads to Deal/Opportunity Conversion</p>
                <h2>0</h2>
              </Col>
              <Col span={8}>
                <p>Closure Percentage</p>
                <h2>0%</h2>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 