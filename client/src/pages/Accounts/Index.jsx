import { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Space, Button, Modal, Form, Input, InputNumber, message } from 'antd';
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
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    received: 0,
    expenses: 0,
    pending: 0,
    total: 0
  });

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
      dataIndex: 'payment_type',
      key: 'payment_type',
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
      dataIndex: 'payment_mode',
      key: 'payment_mode',
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounts?timeRange=${timeRange}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.transactions)) {
        throw new Error('Invalid transactions data received');
      }
      
      setTransactions(data.transactions);
      setStats(data.stats);
    } catch (error) {
      message.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    // fetchData will be triggered by useEffect
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
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      type: record.payment_type,
      mode: record.payment_mode,
      amount: record.amount,
      client_name: record.client_name,
      notes: record.notes
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const formattedValues = {
        payment_type: values.type,
        payment_mode: values.mode,
        amount: Number(values.amount),
        payment_date: new Date().toISOString(),
        client_name: values.client_name || null,
        notes: values.notes || null,
        payment_credit_debit: ['Received', 'Refunds'].includes(values.type) 
          ? 'credit' 
          : 'debit'
      };

      const url = editingRecord 
        ? `/api/accounts/${editingRecord.id}`
        : '/api/accounts';

      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingRecord ? 'update' : 'create'} transaction`);
      }

      await response.json();
      message.success(`Transaction ${editingRecord ? 'updated' : 'created'} successfully`);
      handleModalClose();
      
    } catch (error) {
      message.error(`Error ${editingRecord ? 'updating' : 'creating'} transaction: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await fetch(`/api/accounts/${record.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      message.success('Transaction deleted successfully');
    } catch (error) {
      message.error('Error deleting transaction: ' + error.message);
    }
  };

  const modalTitle = editingRecord ? 'Edit Transaction' : 'Add New Transaction';

  useEffect(() => {
    fetchData();
  }, [timeRange]); // Refetch when timeRange changes

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
                <h2 className="text-2xl font-semibold">Rs.{stats.received.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Expenses</p>
                <h2 className="text-2xl font-semibold">Rs.{stats.expenses.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-red-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending</p>
                <h2 className="text-2xl font-semibold">Rs.{stats.pending.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-yellow-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total</p>
                <h2 className="text-2xl font-semibold">Rs.{stats.total.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-blue-500" />
            </div>
          </Card>
        </div>
      </div>

      <UniversalTable 
        columns={columns}
        dataSource={transactions}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Search transactions..."
        rowKey="id"
      />

      {/* Add Transaction Modal */}
      <Modal
        title={modalTitle}
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
                { value: 'Payments', label: 'Payments' },
                { value: 'Refunds', label: 'Refunds' }
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
                { value: 'Online', label: 'Online' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Cheque', label: 'Cheque' }
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
              formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="client_name"
            label="Client Name"
          >
            <Input placeholder="Enter client name" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={4} placeholder="Enter any additional notes" />
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
              {modalTitle}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
