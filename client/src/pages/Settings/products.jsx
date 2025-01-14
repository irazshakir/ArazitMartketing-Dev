import { Typography, Tabs, Button, Modal, Form, Input, message, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UniversalTable from '../../components/UniversalTable';
import ActionDropdown from '../../components/ActionDropdown';

const { Title } = Typography;

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (search = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('product_name', `%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setProducts(data);
      setTotalProducts(count);
    } catch (error) {
      message.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(values)
          .eq('id', editingProduct.id);

        if (error) throw error;
        message.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([values]);

        if (error) throw error;
        message.success('Product created successfully');
      }

      handleCancel();
      fetchProducts();
    } catch (error) {
      message.error(`Error ${editingProduct ? 'updating' : 'creating'} product`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Error deleting product');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'product_name',
      key: 'product_name',
      align: 'left',
      render: (text) => (
        <span className="font-normal">{text}</span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'product_is_active',
      key: 'product_is_active',
      align: 'center',
      render: (active) => (
        <span className={`${active ? 'text-green-600' : 'text-red-600'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <ActionDropdown 
          onEdit={() => handleEdit(record)}
          onDelete={() => {
            Modal.confirm({
              title: 'Delete Product',
              content: `Are you sure you want to delete ${record.product_name}?`,
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => handleDelete(record)
            });
          }}
        />
      ),
    },
  ];

  // Navigation tabs configuration
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
    {
      key: 'company-branches',
      label: 'Company Branches',
    },
  ];

  const handleTabChange = (key) => {
    switch(key) {
      case 'general':
        navigate('/admin/settings/general');
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
        case 'company-branches':
          navigate('/admin/settings/company-branches');
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
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            backgroundColor: '#aa2478',
            borderColor: '#aa2478'
          }}
        >
          Add Product
        </Button>
      </div>

      <Tabs 
        items={items} 
        activeKey={getActiveKey()}
        onChange={handleTabChange}
        className="custom-tabs"
      />

      <UniversalTable 
        columns={columns}
        dataSource={products}
        loading={loading}
        totalItems={totalProducts}
        onSearch={fetchProducts}
        searchPlaceholder="Search products..."
        className="settings-table"
      />

      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ product_is_active: true }}
        >
          <Form.Item
            name="product_name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="product_is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
              defaultChecked
              style={{
                backgroundColor: '#d9d9d9',
                '&.ant-switch-checked': {
                  backgroundColor: '#52c41a',
                },
              }}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ 
                backgroundColor: '#aa2478',
                borderColor: '#aa2478'
              }}
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products; 