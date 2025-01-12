import React from 'react';
import { Modal, Form, Input, DatePicker, Select, message } from 'antd';

const { TextArea } = Input;

const AddPaymentModal = ({ visible, onClose, invoiceId, remainingAmount, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        }),
      });

      if (!response.ok) throw new Error('Failed to add payment');

      message.success('Payment added successfully');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Modal
      title="Add Payment"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true },
            { 
              validator: (_, value) => {
                if (value > remainingAmount) {
                  return Promise.reject('Amount cannot exceed remaining balance');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            prefix="PKR"
            type="number"
            max={remainingAmount}
          />
        </Form.Item>

        <Form.Item
          label="Payment Type"
          name="paymentType"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Online', label: 'Online' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Payment Date"
          name="paymentDate"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Notes"
          name="notes"
        >
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPaymentModal; 