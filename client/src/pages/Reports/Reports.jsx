import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Select, DatePicker, Table, Space, message, Tag } from 'antd';
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
import { Line } from '@ant-design/plots';
import TableSkeleton from '../../components/TableSkeleton';

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
  const [userStats, setUserStats] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchReportStats();
    fetchUserStats();
    fetchTrendData();
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

  const fetchUserStats = async (dateRange) => {
    try {
      setLoadingTable(true);
      const response = await axios.get('/api/reports/user-stats', {
        params: {
          branchId: selectedBranch,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        }
      });
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      message.error('Failed to fetch user statistics');
    } finally {
      setLoadingTable(false);
    }
  };

  const fetchTrendData = async (dateRange) => {
    try {
      setLoadingChart(true);
      const response = await axios.get('/api/reports/trends', {
        params: {
          branchId: selectedBranch,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        }
      });
      setTrendData(response.data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      message.error('Failed to fetch trend data');
    } finally {
      setLoadingChart(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) {
      fetchReportStats();
      fetchUserStats();
      fetchTrendData();
      return;
    }

    const [start, end] = dates;
    const dateRange = {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    };
    
    fetchReportStats(dateRange);
    fetchUserStats(dateRange);
    fetchTrendData(dateRange);
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
    fetchReportStats({ branchId: value });
    fetchUserStats({ branchId: value });
    fetchTrendData({ branchId: value });
  };

  // Chart configuration
  const trendConfig = {
    data: trendData,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
          fontWeight: 500
        }
      }
    },
    yAxis: {
      grid: {
        line: {
          style: {
            stroke: '#E5E7EB',
            lineWidth: 1,
            lineDash: [4, 5],
            strokeOpacity: 0.7,
          },
        },
      },
    },
    legend: {
      position: 'top',
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    color: ['#7367F0', '#28C76F'],  // Theme colors for leads and sales
  };

  // Transform data for chart
  const chartData = trendData.reduce((acc, item) => {
    acc.push(
      { month: item.month, value: item.leads, category: 'Leads' },
      { month: item.month, value: item.sales, category: 'Sales' }
    );
    return acc;
  }, []);

  // Helper function to get conversion ratio color
  const getConversionRatioTag = (ratio) => {
    const value = parseFloat(ratio);
    if (value >= 15) {
      return <Tag color="success">{ratio}</Tag>;
    } else if (value < 5) {
      return <Tag color="error">{ratio}</Tag>;
    }
    return <span>{ratio}</span>;
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

      {/* Leads Analysis Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Leads Analysis by Users" className="report-card">
            <Row gutter={[24, 0]}>
              {/* Table Section */}
              <Col xs={24} xl={14}>
                <div className="table-section">
                  <div className="table-header">
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      className="theme-button"
                      style={{ marginBottom: '24px' }}
                    >
                      Export
                    </Button>
                  </div>
                  {loadingTable ? (
                    <TableSkeleton />
                  ) : (
                    <Table
                      dataSource={userStats}
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
                          title: 'Sales',
                          dataIndex: 'sales',
                          key: 'sales',
                          sorter: (a, b) => a.sales - b.sales,
                        },
                        {
                          title: 'Conversion Ratio',
                          dataIndex: 'conversionRatio',
                          key: 'conversionRatio',
                          sorter: (a, b) => parseFloat(a.conversionRatio) - parseFloat(b.conversionRatio),
                          render: (ratio) => getConversionRatioTag(ratio)
                        }
                      ]}
                      bordered
                      size="middle"
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                      }}
                    />
                  )}
                </div>
              </Col>

              {/* Trend Chart Section */}
              <Col xs={24} xl={10}>
                <div className="trend-section">
                  {loadingChart ? (
                    <TableSkeleton />
                  ) : (
                    <>
                      <Title level={5}>Leads vs Sales Trend</Title>
                      <Line {...trendConfig} data={chartData} height={300} />
                    </>
                  )}
                </div>
              </Col>
            </Row>
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

// Add these styles to your CSS file
const styles = `
  .ant-tag {
    min-width: 70px;
    text-align: center;
    font-weight: 500;
  }
`;

export default Reports;
