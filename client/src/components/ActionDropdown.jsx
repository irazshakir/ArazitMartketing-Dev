import { Dropdown } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import theme from '../theme';

const ActionDropdown = ({ onEdit, onDelete }) => {
  const items = [
    {
      key: 'edit',
      label: (
        <div className="flex items-center gap-2">
          <EditOutlined />
          <span>Edit</span>
        </div>
      ),
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: (
        <div className="flex items-center gap-2 text-red-600">
          <DeleteOutlined />
          <span>Delete</span>
        </div>
      ),
      onClick: onDelete,
    },
  ];

  return (
    <Dropdown 
      menu={{ items }} 
      trigger={['click']}
      placement="bottomRight"
    >
      <MoreOutlined 
        className="text-lg cursor-pointer" 
        style={{ color: theme.colors.primary }}
      />
    </Dropdown>
  );
};

export default ActionDropdown; 