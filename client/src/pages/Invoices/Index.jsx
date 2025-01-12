import { useState, useEffect } from 'react';
import { Card, DatePicker, Select, Space, Button, Modal, message } from 'antd';
import { DollarOutlined, PlusOutlined } from '@ant-design/icons';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';
import InvoiceModel from '../../components/InvoiceModel/InvoiceModel';
import EditInvoice from './EditInvoice';

const { RangePicker } = DatePicker;

const Invoices = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [statistics, setStatistics] = useState({
    active: 0,
    received: 0,
    pending: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/invoices?search=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      
      const data = await response.json();
      
      // Calculate statistics
      const stats = data.reduce((acc, invoice) => ({
        active: acc.active + (invoice.status !== 'Paid' ? 1 : 0),
        received: acc.received + Number(invoice.amount_received),
        pending: acc.pending + Number(invoice.remaining_amount)
      }), { active: 0, received: 0, pending: 0 });

      setStatistics(stats);
      setInvoices(data);
    } catch (error) {
      message.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, timeRange, dateRange]);

  const columns = [
    {
      title: 'SR',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: 'NAME',
      dataIndex: 'bill_to',
      key: 'bill_to',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-sm font-medium text-pink-600">
              {text.charAt(0)}
            </span>
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'INVOICE#',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'RECEIVED',
      dataIndex: 'amount_received',
      key: 'amount_received',
      render: (amount) => `PKR ${Number(amount).toFixed(2)}`,
    },
    {
      title: 'PENDING',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      render: (amount) => `PKR ${Number(amount).toFixed(2)}`,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span 
          className={`px-2 py-1 rounded-full ${
            status === 'Paid' ? 'bg-green-50 text-green-600' : 
            status === 'Partially Paid' ? 'bg-yellow-50 text-yellow-600' : 
            'bg-red-50 text-red-600'
          } text-sm`}
        >
          {status}
        </span>
      ),
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

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleModalOpen = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleModalClose = () => {
    setIsInvoiceModalOpen(false);
    fetchInvoices(); // Refresh the list after closing modal
  };

  const handleEdit = (record) => {
    setSelectedInvoice(record);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setSelectedInvoice(null);
    setIsEditModalVisible(false);
  };

  const handleDelete = async (record) => {
    // Implement delete functionality
    message.info('Delete functionality coming soon');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleModalOpen}
            style={{ 
              backgroundColor: '#aa2478',
              borderColor: '#aa2478'
            }}
          >
            Add Invoice
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Active</p>
                <h2 className="text-2xl font-semibold">{statistics.active}</h2>
              </div>
              <DollarOutlined className="text-2xl text-blue-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Payments Received</p>
                <h2 className="text-2xl font-semibold">PKR {statistics.received.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending Payments</p>
                <h2 className="text-2xl font-semibold">PKR {statistics.pending.toFixed(2)}</h2>
              </div>
              <DollarOutlined className="text-2xl text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      <UniversalTable 
        columns={columns}
        dataSource={invoices}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Search invoices..."
      />

      <Modal
        title="Create New Invoice"
        open={isInvoiceModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        style={{ top: 20 }}
        destroyOnClose
      >
        <InvoiceModel onClose={handleModalClose} />
      </Modal>

      <EditInvoice
        invoice={selectedInvoice}
        visible={isEditModalVisible}
        onClose={handleEditModalClose}
        onUpdate={() => {
          fetchInvoices();
          handleEditModalClose();
        }}
      />
    </div>
  );
};

export default Invoices;
