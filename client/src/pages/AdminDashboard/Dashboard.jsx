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

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const cardData = [
    { icon: <ClockCircleOutlined style={{ color: '#FF9F43' }} />, count: 0, title: "Today's Leads" },
    { icon: <UserAddOutlined style={{ color: '#28C76F' }} />, count: 0, title: "Fresh Leads" },
    { icon: <TeamOutlined style={{ color: '#00CFE8' }} />, count: 0, title: "Assigned Leads" },
    { icon: <PhoneOutlined style={{ color: '#EA5455' }} />, count: 0, title: "Today's Followups" },
    { icon: <FireOutlined style={{ color: '#FF4D4F' }} />, count: 0, title: "Hot Stage Leads" },
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

  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    { value: 'branch1', label: 'Branch 1' },
    { value: 'branch2', label: 'Branch 2' },
    { value: 'branch3', label: 'Branch 3' },
  ];

  return (
    <div className="dashboard-container">
      <Title level={2}>Admin Dashboard</Title>

      <div className="dashboard-filters">
        <div className="filter-group">
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            options={branchOptions}
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