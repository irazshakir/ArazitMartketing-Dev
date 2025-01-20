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
import { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileDropdown = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserAndCompanyData();
  }, []);

  const fetchUserAndCompanyData = async () => {
    try {
      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        // Check if user is admin
        setIsAdmin(user?.roles?.role_name?.toLowerCase() === 'admin');
      }

      // Fetch company data
      const response = await axios.get('/api/general-settings');
      if (response.data?.success) {
        setCompanyData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
    <div className="bg-white rounded-lg shadow-lg py-3" style={{ width: 250 }}>
      {/* Company Info Section */}
      <div className="px-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-sm font-medium text-red-600">L</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-medium truncate">{companyData?.company_name || 'Company Name'}</h3>
            <a 
              href={companyData?.website || 'https://www.indegotourism.com/'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
              style={{ color: theme.colors.primary }}
            >
              <GlobalOutlined className="text-xs" />
              <span className="truncate">{companyData?.website || 'https://www.indegotourism.com/'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Menu Items - Only show for admin */}
      {isAdmin && (
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
      )}

      {/* User Info Section */}
      <div className="px-4 py-3 border-t border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <span className="text-sm font-medium text-pink-600">
              {userData?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userData?.name || 'User'}</span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                {userData?.roles?.role_name || 'Role'}
              </span>
            </div>
            <p className="text-xs text-gray-500">{userData?.email || 'email@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Notification Settings - Only show for admin */}
      {isAdmin && (
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
      )}

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
        {/* <a 
          href="#" 
          className="px-4 py-2 flex items-center transition-colors duration-150"
          style={menuItemStyle}
        >
          <UserOutlined className="mr-3" />
          <span>Profile</span>
        </a> */}
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