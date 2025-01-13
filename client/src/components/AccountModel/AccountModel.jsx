import { Form, Input, Select, DatePicker, InputNumber, Modal } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AccountModel = ({ open, onCancel, onSubmit, initialValues, title = "Add New Transaction" }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      // Convert payment_date to dayjs object for DatePicker
      const formattedValues = {
        ...initialValues,
        payment_date: initialValues.payment_date ? dayjs(initialValues.payment_date) : undefined
      };
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Transform the date back to ISO string
      const formattedValues = {
        ...values,
        payment_date: values.payment_date?.toISOString(),
        // Automatically set credit/debit based on payment_type
        payment_credit_debit: ['Received', 'Refunds'].includes(values.payment_type) 
          ? 'credit' 
          : 'debit'
      };
      
      await onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      confirmLoading={loading}
      onOk={form.submit}
      okText={initialValues ? "Update" : "Add"}
      okButtonProps={{
        style: { backgroundColor: '#aa2478', borderColor: '#aa2478' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          payment_date: dayjs(),
        }}
      >
        <Form.Item
          name="payment_type"
          label="Transaction Type"
          rules={[{ required: true, message: 'Please select transaction type' }]}
        >
          <Select
            placeholder="Select type"
            options={[
              { value: 'Received', label: 'Received' },
              { value: 'Expenses', label: 'Expenses' },
              { value: 'Payments', label: 'Payments' },
              { value: 'Refunds', label: 'Refunds' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="payment_mode"
          label="Payment Mode"
          rules={[{ required: true, message: 'Please select payment mode' }]}
        >
          <Select
            placeholder="Select mode"
            options={[
              { value: 'Online', label: 'Online' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter amount' },
            { type: 'number', min: 0, message: 'Amount must be greater than 0' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Enter amount"
            formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="payment_date"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker 
            className="w-full" 
            format="YYYY-MM-DD"
            showTime={false}
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
          <TextArea 
            rows={4} 
            placeholder="Enter any additional notes"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountModel;
