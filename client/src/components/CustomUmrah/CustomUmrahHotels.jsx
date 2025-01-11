import React from 'react';
import { Form, Input, DatePicker, InputNumber, Space, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CustomUmrahHotels = ({ data, onChange }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_, allValues) => {
    const formattedData = {
      ...allValues,
      checkin_date: allValues.date_range?.[0]?.format('YYYY-MM-DD'),
      checkout_date: allValues.date_range?.[1]?.format('YYYY-MM-DD'),
      hotel_price: parseFloat(allValues.hotel_price || 0),
      number_of_rooms: parseInt(allValues.number_of_rooms || 0),
      date_range: undefined
    };

    onChange(formattedData);
  };

  const initialValues = data ? {
    ...data,
    date_range: data.checkin_date && data.checkout_date ? [
      dayjs(data.checkin_date),
      dayjs(data.checkout_date)
    ] : undefined,
  } : undefined;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        name="umrah_city"
        label="City"
        rules={[{ required: true, message: 'Required' }]}
      >
        <Select>
          <Option value="Makkah">Makkah</Option>
          <Option value="Medinah">Medinah</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="hotel_name"
        label="Hotel Name"
        rules={[{ required: true, message: 'Required' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="date_range"
        label="Check-in/Check-out Dates"
        rules={[{ required: true, message: 'Required' }]}
      >
        <RangePicker style={{ width: '100%' }} />
      </Form.Item>

      <Space style={{ display: 'flex', gap: '16px' }}>
        <Form.Item
          name="hotel_star"
          label="Hotel Star Rating"
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0, flex: 1 }}
        >
          <Select>
            {['5', '4', '3', 'Economy', 'Sharing'].map(star => (
              <Option key={star} value={star}>{star}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="room_type"
          label="Room Type"
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0, flex: 1 }}
        >
          <Select>
            {['Quint', 'Quad', 'Triple', 'Double', 'Economy', 'Sharing'].map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>
      </Space>

      <Space style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        <Form.Item
          name="number_of_rooms"
          label="Number of Rooms"
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0, flex: 1 }}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="hotel_price"
          label="Hotel Price"
          rules={[{ required: true, message: 'Required' }]}
          style={{ marginBottom: 0, flex: 1 }}
        >
          <InputNumber
            min={0}
            formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value?.replace(/,/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Space>
    </Form>
  );
};

export default CustomUmrahHotels; 