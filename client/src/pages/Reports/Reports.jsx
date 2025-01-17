import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Select, DatePicker, Table, Space } from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
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
    fetchBranches();
    fetchReportStats();
  }, []);

  useEffect(() => {
    fetchReportStats();
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
      console.error('Error fetching branches:', error);
      setBranches([{ value: 'all', label: 'All Branches' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async (options = {}) => {
    try {
      setLoading(true);
      const { startDate, endDate } = options;
      
      const params = {
        branchId: selectedBranch
      };

      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get('/api/reports/stats', { params });

      if (response.data?.success) {
        setReportStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
      setReportStats({
        newLeads: 0
      });
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
    fetchReportStats({
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    });
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

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
  };

  return (
    <div className="dashboard-container">
      <Title level={2}>Reports</Title>

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

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Leads Chart" className="report-card">
            <Table
              dataSource={[
                {
                  key: '1',
                  userName: 'John Doe',
                  new: 45,
                  active: 30,
                  closed: 15,
                  sale: 10,
                  conversionRatio: '22%',
                },
                {
                  key: '2',
                  userName: 'Jane Smith',
                  new: 38,
                  active: 25,
                  closed: 12,
                  sale: 8,
                  conversionRatio: '21%',
                },
                // Add more sample data as needed
              ]}
              columns={[
                {
                  title: 'User Name',
                  dataIndex: 'userName',
                  key: 'userName',
                },
                {
                  title: 'New',
                  dataIndex: 'new',
                  key: 'new',
                  sorter: (a, b) => a.new - b.new,
                },
                {
                  title: 'Active',
                  dataIndex: 'active',
                  key: 'active',
                  sorter: (a, b) => a.active - b.active,
                },
                {
                  title: 'Closed',
                  dataIndex: 'closed',
                  key: 'closed',
                  sorter: (a, b) => a.closed - b.closed,
                },
                {
                  title: 'Sale',
                  dataIndex: 'sale',
                  key: 'sale',
                  sorter: (a, b) => a.sale - b.sale,
                },
                {
                  title: 'Conversion Ratio',
                  dataIndex: 'conversionRatio',
                  key: 'conversionRatio',
                  sorter: (a, b) => a.conversionRatio.localeCompare(b.conversionRatio),
                },
              ]}
              bordered
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Product Wise Chart Table */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Product Wise Chart" className="report-card">
            <Table
              dataSource={[
                {
                  key: '1',
                  userName: 'Product A',
                  new: 35,
                  active: 20,
                  closed: 12,
                  sale: 8,
                  conversionRatio: '23%',
                },
                {
                  key: '2',
                  userName: 'Product B',
                  new: 42,
                  active: 28,
                  closed: 15,
                  sale: 10,
                  conversionRatio: '24%',
                },
                // Add more sample data as needed
              ]}
              columns={[
                {
                  title: 'Product Name',
                  dataIndex: 'userName',
                  key: 'userName',
                },
                {
                  title: 'New',
                  dataIndex: 'new',
                  key: 'new',
                  sorter: (a, b) => a.new - b.new,
                },
                {
                  title: 'Active',
                  dataIndex: 'active',
                  key: 'active',
                  sorter: (a, b) => a.active - b.active,
                },
                {
                  title: 'Closed',
                  dataIndex: 'closed',
                  key: 'closed',
                  sorter: (a, b) => a.closed - b.closed,
                },
                {
                  title: 'Sale',
                  dataIndex: 'sale',
                  key: 'sale',
                  sorter: (a, b) => a.sale - b.sale,
                },
                {
                  title: 'Conversion Ratio',
                  dataIndex: 'conversionRatio',
                  key: 'conversionRatio',
                  sorter: (a, b) => a.conversionRatio.localeCompare(b.conversionRatio),
                },
              ]}
              bordered
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stage Wise Table */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Stage Wise" className="report-card">
            <Table
              dataSource={[
                {
                  key: '1',
                  stageName: 'Initial Contact',
                  active: 45,
                  closed: 30,
                },
                {
                  key: '2',
                  stageName: 'Meeting Scheduled',
                  active: 38,
                  closed: 25,
                },
                // Add more sample data as needed
              ]}
              columns={[
                {
                  title: 'Stage Name',
                  dataIndex: 'stageName',
                  key: 'stageName',
                },
                {
                  title: 'Active',
                  dataIndex: 'active',
                  key: 'active',
                  sorter: (a, b) => a.active - b.active,
                },
                {
                  title: 'Closed',
                  dataIndex: 'closed',
                  key: 'closed',
                  sorter: (a, b) => a.closed - b.closed,
                },
              ]}
              bordered
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Reports;
