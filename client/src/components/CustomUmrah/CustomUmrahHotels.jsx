import React from 'react';
import { Form, Select, Input, DatePicker, InputNumber, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import theme from '../../theme';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CustomUmrahHotels = ({ data, onChange }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_, allValues) => {
    onChange(allValues.hotels || []);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ hotels: data?.length ? data : [{}] }}
      onValuesChange={handleValuesChange}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <Form.List name="hotels">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} style={{ 
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                position: 'relative'
              }}>
                {fields.length > 1 && (
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      color: '#ff4d4f'
                    }}
                  />
                )}
                
                <Form.Item
                  {...restField}
                  name={[name, 'umrah_city']}
                  label="City"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select>
                    <Option value="Makkah">Makkah</Option>
                    <Option value="Medinah">Medinah</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'hotel_name']}
                  label="Hotel Name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'date_range']}
                  label="Check-in/Check-out Dates"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>

                <Space style={{ display: 'flex', gap: '16px' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'hotel_star']}
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
                    {...restField}
                    name={[name, 'room_type']}
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
                    {...restField}
                    name={[name, 'number_of_rooms']}
                    label="Number of Rooms"
                    rules={[{ required: true, message: 'Required' }]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'hotel_price']}
                    label="Hotel Price"
                    rules={[{ required: true, message: 'Required' }]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <InputNumber
                      min={0}
                      formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/,/g, '')}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Space>
              </div>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                style={{ maxWidth: '600px' }}
              >
                Add Hotel
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default CustomUmrahHotels; 