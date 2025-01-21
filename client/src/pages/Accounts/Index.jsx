import { useState } from 'react';
import { Card, DatePicker, Select, Space, Button, Modal, Form, Input, InputNumber } from 'antd';
import { DollarOutlined, PlusOutlined } from '@ant-design/icons';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';

const { RangePicker } = DatePicker;

const Accounts = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'SR',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span 
          className={`px-2 py-1 rounded-full ${
            type === 'Received' ? 'bg-green-50 text-green-600' : 
            type === 'Expenses' ? 'bg-red-50 text-red-600' : 
            'bg-blue-50 text-blue-600'
          } text-sm`}
        >
          {type}
        </span>
      ),
    },
    {
      title: 'MODE',
      dataIndex: 'mode',
      key: 'mode',
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rs.${amount.toFixed(2)}`,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  // Sample data - replace with actual data from your API
  const mockData = [
    {
      id: 1,
      type: 'Received',
      mode: 'Online',
      amount: 5000.00,
    },
    {
      id: 2,
      type: 'Expenses',
      mode: 'Cash',
      amount: 1500.00,
    },
    {
      id: 3,
      type: 'Payment',
      mode: 'Cheque',
      amount: 3000.00,
    },
  ];

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    // Add logic to fetch data based on selected time range
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    // Add logic to fetch data based on selected date range
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Add search logic here
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleSubmit = async (values) => {
    try {
      message.success('Account created successfully');
      handleModalClose();
    } catch (error) {
      message.error('Error creating account: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleModalOpen}
            style={{ 
              backgroundColor: '#aa2478',
              borderColor: '#aa2478'
            }}
          >
            Add Transaction
          </Button>
        </div>

        <Space className="mb-6" size="middle">
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 200 }}
            options={[
              { value: '7days', label: 'Past 7 Days' },
              { value: '30days', label: 'Past 30 Days' },
              { value: '90days', label: 'Past 90 Days' },
              { value: 'prevMonth', label: 'Previous Month' },
              { value: 'currMonth', label: 'Current Month' },
            ]}
          />
          <RangePicker onChange={handleDateRangeChange} />
        </Space>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Received</p>
                <h2 className="text-2xl font-semibold">Rs. 47,500</h2>
              </div>
              <DollarOutlined className="text-2xl text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Expenses</p>
                <h2 className="text-2xl font-semibold">Rs.1,500</h2>
              </div>
              <DollarOutlined className="text-2xl text-red-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending</p>
                <h2 className="text-2xl font-semibold">Rs.27,500</h2>
              </div>
              <DollarOutlined className="text-2xl text-yellow-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total</p>
                <h2 className="text-2xl font-semibold">Rs.46,000</h2>
              </div>
              <DollarOutlined className="text-2xl text-blue-500" />
            </div>
          </Card>
        </div>
      </div>

      <UniversalTable 
        columns={columns}
        dataSource={mockData}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Search transactions..."
      />

      {/* Add Transaction Modal */}
      <Modal
        title="Add New Transaction"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="type"
            label="Transaction Type"
            rules={[{ required: true, message: 'Please select transaction type' }]}
          >
            <Select
              placeholder="Select type"
              options={[
                { value: 'Received', label: 'Received' },
                { value: 'Expenses', label: 'Expenses' },
                { value: 'Payment', label: 'Payment' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="mode"
            label="Payment Mode"
            rules={[{ required: true, message: 'Please select payment mode' }]}
          >
            <Select
              placeholder="Select mode"
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Online', label: 'Online' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="Enter amount"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              type="primary"
              htmlType="submit"
              style={{ 
                backgroundColor: '#aa2478',
                borderColor: '#aa2478'
              }}
            >
              Add Transaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
