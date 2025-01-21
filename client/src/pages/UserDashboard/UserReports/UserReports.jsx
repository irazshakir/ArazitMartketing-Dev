import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, DatePicker, Button, message } from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import TableSkeleton from '../../../components/TableSkeleton';
import './UserReports.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const UserReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportStats, setReportStats] = useState({
    newLeads: 0,
    activeLeads: 0,
    closedLeads: 0,
    salesLeads: 0,
    nonPotentialLeads: 0,
    hotLeads: 0,
    followupRequired: 0
  });

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async (options = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user_jwt');
      const response = await axios.get('/api/user-dashboard/user-report-stats', {
        params: options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setReportStats(response.data?.data || {});
    } catch (error) {
      message.error('Failed to fetch report statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      fetchReportStats();
      return;
    }

    const [start, end] = dates;
    const dateRange = {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    };
    
    fetchReportStats(dateRange);
  };

  const cardData = [
    { 
      icon: <FileTextOutlined style={{ color: '#FF9F43' }} />, 
      count: reportStats.newLeads, 
      title: "New Leads" 
    },
    { 
      icon: <BarChartOutlined style={{ color: '#28C76F' }} />, 
      count: reportStats.activeLeads, 
      title: "Active Leads" 
    },
    { 
      icon: <PieChartOutlined style={{ color: '#EA5455' }} />, 
      count: reportStats.closedLeads, 
      title: "Closed Leads" 
    },
    { 
      icon: <DollarOutlined style={{ color: '#FF4D4F' }} />, 
      count: reportStats.salesLeads, 
      title: "Sales" 
    },
    { 
      icon: <FileTextOutlined style={{ color: '#7367F0' }} />, 
      count: reportStats.nonPotentialLeads, 
      title: "Not Potential" 
    },
    { 
      icon: <BarChartOutlined style={{ color: '#00CFE8' }} />, 
      count: reportStats.hotLeads, 
      title: "Hot Leads" 
    },
    { 
      icon: <ClockCircleOutlined style={{ color: '#FF6B6B' }} />, 
      count: reportStats.followupRequired, 
      title: "Followup Required" 
    }
  ];

  return (
    <div className="dashboard-container">
      <Title level={2}>My Reports</Title>

      <div className="dashboard-filters">
        <div className="filter-group">
          <RangePicker 
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            className="theme-button"
          >
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <Row gutter={[24, 24]}>
          {cardData.map((card, index) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={4} key={index}>
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
      )}
    </div>
  );
};

export default UserReports; 