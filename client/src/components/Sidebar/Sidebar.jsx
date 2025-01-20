import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
  BarChartOutlined,
  FileTextOutlined,
  BankOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  HistoryOutlined,
  DollarOutlined,
  TeamOutlined,
  BranchesOutlined,
  HomeOutlined as HotelOutlined,
  GiftOutlined
} from '@ant-design/icons';
import Logo from './Logo';
import { useState, useEffect } from 'react';
import theme from '../../theme';
import UserProfile from './UserProfile';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PropTypes from 'prop-types';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      // Get user data from localStorage instead of making a new Supabase query
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserRole(userData.roles.role_name);
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  };

  const handleToggle = () => {
    console.log('Toggle clicked in Sidebar, current collapsed state:', collapsed);
    if (typeof onCollapse === 'function') {
      onCollapse();
    }
  };

  const adminMenuItems = [
    { 
      key: '/admin/dashboard',
      icon: <HomeOutlined />, 
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    { 
      key: '/admin/leads',
      icon: <UserOutlined />, 
      label: 'Leads',
      path: '/admin/leads'
    },
    { 
      key: '/admin/conversations',
      icon: <MessageOutlined />, 
      label: 'Conversations',
      path: '/admin/conversations'
    },
    { 
      key: 'analytics', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { 
          key: '/admin/reports',
          icon: <PieChartOutlined />,
          label: 'Reports',
          path: '/admin/reports'
        },
        { 
          key: '/admin/analytics/logs', 
          icon: <HistoryOutlined />,
          label: 'Logs',
          path: '/admin/analytics/logs' 
        }
      ]
    },
    { 
      key: '/admin/invoices',
      icon: <FileTextOutlined />, 
      label: 'Invoices',
      path: '/admin/invoices'
    },
    { 
      key: '/admin/accounts',
      icon: <BankOutlined />, 
      label: 'Accounts',
      path: '/admin/accounts'
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      children: [
        { 
          key: '/admin/settings/general', 
          icon: <SettingOutlined />,
          label: 'General',
          path: '/admin/settings/general' 
        },
        { 
          key: '/admin/settings/accounts', 
          icon: <DollarOutlined />,
          label: 'Accounts',
          path: '/admin/settings/accounts' 
        },
        { 
          key: '/admin/settings/canned-messages', 
          icon: <BranchesOutlined />,
          label: 'Canned Messages',
          path: '/admin/settings/canned-messages' 
        },
        { 
          key: '/admin/settings/template-messages', 
          icon: <HotelOutlined />,
          label: 'Template Messages',
          path: '/admin/settings/template-messages' 
        }
      ]
    },
  ];

  const userMenuItems = [
    { 
      key: '/user/dashboard',
      icon: <HomeOutlined />, 
      label: 'Dashboard',
      path: '/user/dashboard'
    },
    { 
      key: '/user/leads',
      icon: <UserOutlined />, 
      label: 'Leads',
      path: '/user/leads'
    },
    { 
      key: '/user/conversations',
      icon: <MessageOutlined />, 
      label: 'Conversations',
      path: '/user/conversations'
    },
    { 
      key: 'analytics', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { 
          key: '/user/reports',
          icon: <PieChartOutlined />,
          label: 'Reports',
          path: '/user/reports'
        }
      ]
    }
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return adminMenuItems;
      case 'manager':
        // Add manager menu items when needed
        return [];
      case 'user':
        return userMenuItems;
      default:
        return [];
    }
  };

  return (
    <Sider
      width={250}
      collapsedWidth={80}
      collapsed={collapsed}
      theme="light"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 1000,
        transition: 'all 0.2s'
      }}
    >
      <div className="flex justify-between items-center" style={{ padding: '16px' }}>
        <Logo collapsed={collapsed} />
        <button
          type="button"
          onClick={handleToggle}
          className="text-gray-500 hover:text-primary rounded transition-colors"
          style={{ 
            '--tw-text-opacity': 1, 
            '--text-primary': theme.colors.primary,
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      
      <div style={{ 
        height: 'calc(100vh - 140px)', 
        overflowY: 'auto',
        transition: 'all 0.2s'
      }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems().map(item => ({
            ...item,
            label: item.path ? (
              <NavLink 
                to={item.path}
                className={({ isActive }) => isActive ? 'text-primary' : ''}
              >
                {item.label}
              </NavLink>
            ) : item.label,
            ...(item.children && {
              children: item.children.map(child => ({
                ...child,
                label: child.path ? (
                  <NavLink 
                    to={child.path}
                    className={({ isActive }) => isActive ? 'text-primary' : ''}
                  >
                    {child.label}
                  </NavLink>
                ) : child.label
              }))
            })
          }))}
          className="border-r-0"
          inlineCollapsed={collapsed}
          style={{ transition: 'all 0.2s' }}
        />
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0',
        transition: 'all 0.2s'
      }}>
        <UserProfile collapsed={collapsed} />
      </div>
    </Sider>
  );
};

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired
};

export default Sidebar; 