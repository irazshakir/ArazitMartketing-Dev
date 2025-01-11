import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const CustomUmrahServices = ({ data, onChange }) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([{
    service_name: '',
    description: '',
    price: ''
  }]);

  const handleValuesChange = (_, allValues) => {
    onChange(allValues.services || []);
  };

  return (
    <Form
      form={form}
      initialValues={{ services: data }}
      onValuesChange={handleValuesChange}
    >
      <Form.List name="services">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'service_name']}
                  rules={[{ required: true, message: 'Missing service name' }]}
                >
                  <Input placeholder="Service Name" />
                </Form.Item>
                
                <Form.Item
                  {...restField}
                  name={[name, 'description']}
                >
                  <Input.TextArea placeholder="Description" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'price']}
                  rules={[{ required: true, message: 'Missing price' }]}
                >
                  <InputNumber
                    placeholder="Price"
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/,/g, '')}
                  />
                </Form.Item>

                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Service
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default CustomUmrahServices; 