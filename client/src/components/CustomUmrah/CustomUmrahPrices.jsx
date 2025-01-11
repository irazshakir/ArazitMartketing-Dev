import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Typography } from 'antd';

const { Text } = Typography;

const CustomUmrahPrices = ({ data, onChange }) => {
  const [form] = Form.useForm();
  const [priceData, setPriceData] = useState({
    quotation_amount: '',
    buying_amount: ''
    // profit is auto-generated
  });

  const handleValuesChange = (_, allValues) => {
    const profit = (allValues.quotation_amount || 0) - (allValues.buying_amount || 0);
    onChange({ ...allValues, profit });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={data}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        name="quotation_amount"
        label="Quote to Client"
        rules={[{ required: true, message: 'Please enter quotation amount' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/,/g, '')}
        />
      </Form.Item>

      <Form.Item
        name="buying_amount"
        label="Our Buying Price"
        rules={[{ required: true, message: 'Please enter buying amount' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/,/g, '')}
        />
      </Form.Item>

      <Form.Item label="Expected Profit">
        <Text strong>
          Rs. {((data.quotation_amount || 0) - (data.buying_amount || 0)).toLocaleString()}
        </Text>
      </Form.Item>
    </Form>
  );
};

export default CustomUmrahPrices; 