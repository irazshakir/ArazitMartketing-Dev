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

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
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
          key: '/admin/analytics/reports', 
          icon: <PieChartOutlined />,
          label: 'Reports',
          path: '/admin/analytics/reports' 
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
          key: '/admin/settings/branches', 
          icon: <BranchesOutlined />,
          label: 'Branches',
          path: '/admin/settings/branches' 
        },
        { 
          key: '/admin/settings/hotel-rates', 
          icon: <HotelOutlined />,
          label: 'Hotel Rates',
          path: '/admin/settings/hotel-rates' 
        },
        { 
          key: '/admin/settings/packages', 
          icon: <GiftOutlined />,
          label: 'Readymade Packages',
          path: '/admin/settings/packages' 
        }
      ]
    },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return adminMenuItems;
      case 'manager':
        // Add manager menu items when needed
        return [];
      default:
        // Add user menu items when needed
        return [];
    }
  };

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="min-h-screen bg-white shadow-sm relative"
      theme="light"
      trigger={null}
      style={{ margin: 0, padding: 0 }}
    >
      <div className="flex justify-between items-center" style={{ padding: '16px' }}>
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-primary rounded transition-colors"
          style={{ 
            '--tw-text-opacity': 1, 
            '--text-primary': theme.colors.primary,
            padding: '8px'
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
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
      />
      <div className="absolute bottom-0 left-0 right-0">
        <UserProfile collapsed={collapsed} />
      </div>
    </Sider>
  );
};

export default Sidebar; 