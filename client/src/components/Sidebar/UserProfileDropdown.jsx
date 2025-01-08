import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import theme from '../../theme';
import { authService } from '../../services/authService';
import { message } from 'antd';

const UserProfileDropdown = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      message.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      message.error('Failed to logout');
    }
  };

  const menuItemStyle = {
    '&:hover': {
        backgroundColor: 'rgba(170, 36, 120, 0.2) !important',
      color: `${theme.colors.primary} !important`,
    }
  };

  const logoutStyle = {
    '&:hover': {
      backgroundColor: 'rgba(170, 36, 120, 0.2) !important',
      color: '#ef4444 !important',
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg py-3 min-w-[300px]">
      {/* Company Info Section */}
      <div className="px-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-medium text-blue-600">IT</span>
          </div>
          <div>
            <h3 className="text-sm font-medium">INDEGO TRAVEL AND TOURISM</h3>
            <a 
              href="https://www.indegotourism.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
              style={{ color: theme.colors.primary }}
            >
              <GlobalOutlined className="text-xs" />
              https://www.indegotourism.com/
            </a>
          </div>
        </div>
      </div>

      {/* Main Menu Items */}
      <div className="py-1">
        <a 
          href="#" 
          className="px-4 py-2 flex items-center transition-colors duration-150"
          style={menuItemStyle}
        >
          <UserOutlined className="mr-3" />
          <span>Account Details</span>
        </a>
        <Link 
          to="/admin/users"
          className="px-4 py-2 flex items-center transition-colors duration-150 cursor-pointer"
          style={menuItemStyle}
        >
          <TeamOutlined className="mr-3" />
          <span>Users & roles</span>
        </Link>
      </div>

      {/* User Info Section */}
      <div className="px-4 py-3 border-t border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-sm font-medium text-pink-600">I</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Inzmam</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Admin</span>
            </div>
            <p className="text-xs text-gray-500">inzamamulhaqoficial@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div 
          className="flex items-center justify-between transition-colors duration-150"
          style={menuItemStyle}
        >
          <div className="flex items-center gap-2">
            <BellOutlined />
            <span className="text-sm">Push Notification</span>
          </div>
          <Switch size="small" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>Failed please retry?</span>
          <a 
            href="#" 
            className="hover:underline flex items-center gap-1"
            style={{ color: theme.colors.primary }}
          >
            Need Help? <InfoCircleOutlined />
          </a>
        </div>
      </div>

      {/* Status Section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div 
          className="flex items-center justify-between transition-colors duration-150"
          style={menuItemStyle}
        >
          <div className="flex items-center gap-2">
            <CheckOutlined />
            <span className="text-sm">Active</span>
          </div>
          <Switch defaultChecked size="small" />
        </div>
      </div>

      {/* Profile and Logout */}
      <div className="py-1">
        <a 
          href="#" 
          className="px-4 py-2 flex items-center transition-colors duration-150"
          style={menuItemStyle}
        >
          <UserOutlined className="mr-3" />
          <span>Profile</span>
        </a>
        <a 
          onClick={handleLogout}
          className="px-4 py-2 flex items-center text-red-500 transition-colors duration-150 cursor-pointer"
          style={logoutStyle}
        >
          <LogoutOutlined className="mr-3" />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default UserProfileDropdown; 