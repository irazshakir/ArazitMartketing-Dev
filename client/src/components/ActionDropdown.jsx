import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const ActionDropdown = ({ onEdit, onDelete }) => {
  const items = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: onEdit
    },
    {
      key: 'delete',
      label: <span style={{ color: '#ff4d4f' }}>Delete</span>,
      onClick: onDelete
    }
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      placement="bottomRight"
    >
      <MoreOutlined className="text-xl cursor-pointer" />
    </Dropdown>
  );
};

export default ActionDropdown; 