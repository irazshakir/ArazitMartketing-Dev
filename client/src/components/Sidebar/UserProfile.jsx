import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import theme from '../../theme';
import UserProfileDropdown from './UserProfileDropdown';

const UserProfile = ({ collapsed }) => {
  return (
    <div className="border-t border-gray-100">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">I</span>
          </div>
          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">INDEGO...</p>
              <p className="text-xs text-gray-500 truncate">Inzmam</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Dropdown 
            dropdownRender={() => <UserProfileDropdown />}
            placement="topRight" 
            trigger={['click']}
            overlayStyle={{ minWidth: '320px' }}
          >
            <button
              className="p-1 rounded hover:bg-gray-100"
              style={{ color: theme.colors.primary }}
            >
              <MoreOutlined style={{ fontSize: '20px' }} />
            </button>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 