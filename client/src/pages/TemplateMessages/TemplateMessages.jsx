import '../../global';
import { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Dropdown, 
  Menu,
  Modal,
  Form,
  Input,
  message,
  Layout 
} from 'antd';
import { 
  PlusOutlined,
  MoreOutlined,
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import Editor from '@draft-js-plugins/editor';
import createEmojiPlugin from '@draft-js-plugins/emoji';
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import '@draft-js-plugins/emoji/lib/plugin.css';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css';
import theme from '../../theme';
import TableSkeleton from '../../components/TableSkeleton';
import { supabase } from '../../lib/supabaseClient';
import { RichUtils } from 'draft-js';

const { Title } = Typography;

// Initialize plugins
const emojiPlugin = createEmojiPlugin();
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { EmojiSelect } = emojiPlugin;
const { InlineToolbar } = inlineToolbarPlugin;
const plugins = [emojiPlugin, inlineToolbarPlugin];

const TemplateMessages = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editor = useRef(null);

  // Fetch templates with search
  const fetchTemplates = async (searchTerm = '') => {
    try {
      setLoading(true);
      let query = supabase
        .from('template_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,template_message.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      message.error('Failed to fetch templates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    fetchTemplates(value);
  };

  const handleAddEdit = async (values) => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      const templateMessage = JSON.stringify(rawContent);

      if (editingTemplate) {
        const { error } = await supabase
          .from('template_messages')
          .update({
            title: values.title,
            template_message: templateMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        message.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('template_messages')
          .insert([{
            title: values.title,
            template_message: templateMessage,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        message.success('Template added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingTemplate(null);
      setEditorState(EditorState.createEmpty());
      fetchTemplates();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('template_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      message.error('Delete failed: ' + error.message);
    }
  };

  // Add these new functions for text formatting
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Add this new component for the formatting toolbar
  const FormatToolbar = () => (
    <div style={{ 
      marginBottom: '10px', 
      padding: '5px', 
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      gap: '8px'
    }}>
      <Button
        type="text"
        icon={<BoldOutlined />}
        onClick={() => toggleInlineStyle('BOLD')}
      />
      <Button
        type="text"
        icon={<ItalicOutlined />}
        onClick={() => toggleInlineStyle('ITALIC')}
      />
      <Button
        type="text"
        icon={<UnorderedListOutlined />}
        onClick={() => toggleBlockType('unordered-list-item')}
      />
      <Button
        type="text"
        icon={<OrderedListOutlined />}
        onClick={() => toggleBlockType('ordered-list-item')}
      />
    </div>
  );

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Template Message',
      dataIndex: 'template_message',
      key: 'template_message',
      render: (text) => {
        try {
          const content = convertFromRaw(JSON.parse(text));
          return content.getPlainText();
        } catch (e) {
          return text;
        }
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="edit" 
                onClick={() => {
                  setEditingTemplate(record);
                  form.setFieldsValue({ title: record.title });
                  try {
                    const content = convertFromRaw(JSON.parse(record.template_message));
                    setEditorState(EditorState.createWithContent(content));
                  } catch (e) {
                    setEditorState(EditorState.createEmpty());
                  }
                  setIsModalVisible(true);
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item 
                key="delete" 
                danger 
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Layout style={{ margin: 0, padding: 0 }}>
      <div style={{ 
        background: '#fff', 
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100%'
      }}>
        {/* Header Section */}
        <div style={{ 
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Template Messages</Title>
            <Input.Search
              placeholder="Search templates..."
              allowClear
              style={{ width: 250 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
              onSearch={handleSearch}
            />
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setEditingTemplate(null);
              form.resetFields();
              setEditorState(EditorState.createEmpty());
            }}
            style={{ background: theme.colors.primary }}
          >
            Add Template
          </Button>
        </div>

        {/* Table Section */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table
              columns={columns}
              dataSource={templates}
              rowKey="id"
              pagination={{
                total: templates.length,
                showTotal: (total) => `Total ${total} items`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          )}
        </div>

        {/* Add/Edit Template Modal */}
        <Modal
          title={editingTemplate ? 'Edit Template' : 'Add Template'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTemplate(null);
            form.resetFields();
            setEditorState(EditorState.createEmpty());
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddEdit}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input title!' }]}
            >
              <Input placeholder="Enter template title" />
            </Form.Item>

            <Form.Item
              label="Template Message"
              rules={[{ required: true, message: 'Please input template message!' }]}
            >
              <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '4px' }}>
                <FormatToolbar />
                <Editor
                  editorState={editorState}
                  onChange={setEditorState}
                  plugins={plugins}
                  ref={editor}
                  handleKeyCommand={handleKeyCommand}
                />
                <div style={{ marginTop: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                  <EmojiSelect />
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ background: theme.colors.primary }}
                >
                  {editingTemplate ? 'Update' : 'Submit'}
                </Button>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  setEditingTemplate(null);
                  form.resetFields();
                  setEditorState(EditorState.createEmpty());
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

// Add this CSS to style the editor content
const editorStyles = {
  '.DraftEditor-root': {
    minHeight: '150px',
  },
  '.public-DraftStyleDefault-block': {
    margin: '0.5em 0',
  },
  '.public-DraftStyleDefault-unorderedListItem': {
    marginLeft: '1.5em',
  },
  '.public-DraftStyleDefault-orderedListItem': {
    marginLeft: '1.5em',
  }
};

export default TemplateMessages;
