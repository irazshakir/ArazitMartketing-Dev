import { Typography, Tabs, Button, Form, Input, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import axios from 'axios';
import TableSkeleton from '../../components/TableSkeleton';

const { Title } = Typography;
const { TextArea } = Input;

const GeneralSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        form.setFieldsValue(data);
        if (data.company_logo_url) {
          setFileList([{
            uid: '-1',
            name: 'Company Logo',
            status: 'done',
            url: `${import.meta.env.VITE_API_URL}/assets/${data.company_logo_url}`,
            thumbUrl: `${import.meta.env.VITE_API_URL}/assets/${data.company_logo_url}`
          }]);
        }
      }
    } catch (error) {
      message.error('Error fetching settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let company_logo_url = settings?.company_logo_url;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('logo', fileList[0].originFileObj);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/upload-logo`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        company_logo_url = response.data.path;
      }

      const { company_logo, ...updateValues } = values;

      const { error } = await supabase
        .from('general_settings')
        .upsert({
          id: settings?.id || 1,
          ...updateValues,
          company_logo_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      message.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      message.error('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const items = [
    {
      key: 'general',
      label: 'General',
    },
    {
      key: 'products',
      label: 'Products',
    },
    {
      key: 'stages',
      label: 'Stages',
    },
    {
      key: 'lead-sources',
      label: 'Lead Sources',
    },
  ];

  const handleTabChange = (key) => {
    switch(key) {
      case 'general':
        navigate('/admin/settings');
        break;
      case 'products':
        navigate('/admin/settings/products');
        break;
      case 'stages':
        navigate('/admin/settings/stages');
        break;
      case 'lead-sources':
        navigate('/admin/settings/lead-sources');
        break;
    }
  };

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/admin/settings') return 'general';
    return path.split('/').pop();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Tabs 
        items={items} 
        activeKey={getActiveKey()}
        onChange={handleTabChange}
        className="custom-tabs"
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={settings}
          >
            <Form.Item
              name="company_name"
              label="Company Name"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item
              name="company_phone"
              label="Company Phone"
              rules={[{ required: true, message: 'Please enter company phone' }]}
            >
              <Input placeholder="Enter company phone" />
            </Form.Item>

            <Form.Item
              name="company_email"
              label="Company Email"
              rules={[
                { required: true, message: 'Please enter company email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter company email" />
            </Form.Item>

            <Form.Item
              name="company_address"
              label="Company Address"
              rules={[{ required: true, message: 'Please enter company address' }]}
            >
              <TextArea 
                placeholder="Enter company address" 
                rows={4}
              />
            </Form.Item>

            <Form.Item
              label="Company Logo"
              name="company_logo"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ 
                  backgroundColor: '#aa2478',
                  borderColor: '#aa2478'
                }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

export default GeneralSettings; 