import { Typography, Row, Col, Card, Select, DatePicker, message } from 'antd';
import {
  ClockCircleOutlined,
  UserAddOutlined,
  PhoneOutlined,
  FireOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { Area, Column } from '@ant-design/plots';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import './styles.css';
import TableSkeleton from '../../components/TableSkeleton';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const UserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [currentUser, setCurrentUser] = useState(null);
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

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('user_jwt');
        if (!token) {
          console.error('No valid JWT token found');
          message.error('Please login again');
          return;
        }

        const response = await axios.get('/api/user-dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data?.success) {
          setCurrentUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        message.error('Failed to get current user');
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch dashboard stats when currentUser is available
  useEffect(() => {
    if (currentUser) {
      fetchDashboardStats();
    }
  }, [currentUser]);

  const fetchDashboardStats = async (options = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user_jwt');
      if (!token) {
        message.error('Please login again');
        return;
      }

      console.log('Fetching stats with token:', token);

      const response = await axios.get('/api/user-dashboard/stats', {
        params: {
          timeRange: options.timeRange || selectedTimeRange,
          ...(options.startDate && options.endDate ? { 
            startDate: options.startDate, 
            endDate: options.endDate 
          } : {})
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Stats response:', response.data);

      if (response.data?.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        token: localStorage.getItem('user_jwt')
      });

      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        // Redirect to login page
        window.location.href = '/login';
        return;
      }

      message.error('Failed to fetch dashboard statistics');
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

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      fetchDashboardStats({ timeRange: selectedTimeRange }); // Reset to default time range
      return;
    }

    const [start, end] = dates;
    fetchDashboardStats({
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
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
      count: dashboardStats.hotActiveLeads,
      title: "Hot Stage Leads" 
    },
  ];

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
  };

  const timeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'previousMonth', label: 'Previous Month' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  // Helper function to calculate conversion ratio
  const calculateConversionRatio = (salesLeads, totalPeriodLeads) => {
    if (!totalPeriodLeads) return 0;
    return Math.round((salesLeads / totalPeriodLeads) * 100);
  };

  return (
    <div className="dashboard-container">
      <Title level={2}>My Dashboard</Title>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            value={selectedTimeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 200 }}
            options={timeOptions}
          />
        </div>
        <div className="filter-group">
          <RangePicker 
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
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
                    <h1 className="achievement-number">
                      {calculateConversionRatio(dashboardStats.salesLeads, dashboardStats.totalPeriodLeads)}%
                    </h1>
                    <p className="achievement-text">My Conversion Ratio</p>
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
                      <CheckCircleOutlined className="stat-icon sales" />
                      <div className="stat-info">
                        <span className="stat-value">{dashboardStats.salesLeads}</span>
                        <span className="stat-label">Sales Leads</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="chart-card">
                <Column {...leadsVsDealsConfig} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default UserDashboard; 