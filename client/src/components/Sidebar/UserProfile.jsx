import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import UserProfileDropdown from './UserProfileDropdown';
import theme from '../../theme';

const UserProfile = ({ collapsed }) => {
  return (
    <Dropdown 
      overlay={<UserProfileDropdown />} 
      trigger={['click']}
      placement="topRight"
    >
      <div className="p-4 border-t border-gray-100 cursor-pointer hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-sm font-medium text-pink-600">I</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">Inzmam</h4>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
              <MoreOutlined 
                className="text-lg" 
                style={{ color: theme.colors.primary }}
              />
            </>
          )}
        </div>
      </div>
    </Dropdown>
  );
};

export default UserProfile; 