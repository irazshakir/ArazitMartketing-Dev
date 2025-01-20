import { useState, useEffect } from 'react';
import { Dropdown } from 'antd';
import UserProfileDropdown from './UserProfileDropdown';

const UserProfile = ({ collapsed }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  return (
    <Dropdown 
      dropdownRender={() => <UserProfileDropdown />}
      trigger={['click']}
      placement="topRight"
      arrow={false}
      overlayStyle={{ 
        position: 'fixed',
        zIndex: 1050,
        right: collapsed ? '80px' : '250px',
        bottom: '60px'
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-sm font-medium text-pink-600">
            {userData?.name?.charAt(0) || 'U'}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-grow">
            <div className="text-sm font-medium">{userData?.name || 'User'}</div>
            <div className="text-xs text-gray-500">{userData?.roles?.role_name || 'Role'}</div>
          </div>
        )}
      </div>
    </Dropdown>
  );
};

export default UserProfile; 