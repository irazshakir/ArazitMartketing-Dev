import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import Logo from './Logo';
import { useState } from 'react';
import theme from '../../theme';
import UserProfile from './UserProfile';
import { NavLink } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      key: '/', 
      icon: <HomeOutlined />, 
      label: 'Home',
      path: '/'
    },
    { 
      key: 'conversations', 
      icon: <MessageOutlined />, 
      label: 'Conversations',
      path: '/conversations'
    },
    { 
      key: 'leads', 
      icon: <UserOutlined />, 
      label: 'Leads',
      path: '/leads'
    },
    { 
      key: 'analytics', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { key: 'reports', label: 'Reports', path: '/reports' },
        { key: 'logs', label: 'Logs', path: '/logs' }
      ]
    },
    { 
      key: 'invoices', 
      icon: <FileTextOutlined />, 
      label: 'Invoices',
      path: '/invoices'
    },
    { 
      key: 'users', 
      icon: <TeamOutlined />, 
      label: 'Users',
      path: '/users'
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      children: [
        { key: 'company', label: 'Company', path: '/settings/company' },
        { key: 'accounts', label: 'Accounts', path: '/settings/accounts' },
        { key: 'readyMadePackages', label: 'Ready Made Packages', path: '/settings/packages' },
        { key: 'hotelRates', label: 'Hotel Rates', path: '/settings/hotel-rates' }
      ]
    },
  ];

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="min-h-screen bg-white shadow-sm relative"
      theme="light"
      trigger={null}
    >
      <div className="p-4 flex justify-between items-center">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-primary p-2 rounded transition-colors"
          style={{ '--tw-text-opacity': 1, '--text-primary': theme.colors.primary }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      <Menu
        mode="inline"
        items={menuItems.map(item => ({
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
        <div className={`mx-4 mb-4`}>
          <div 
            className={`flex items-center text-gray-400 text-sm p-2 rounded ${collapsed ? 'justify-center' : ''}`}
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {!collapsed && <span>Quick Search</span>}
            {!collapsed && <span className="ml-auto">Ctrl + K</span>}
            {collapsed && <span>⌘K</span>}
          </div>
        </div>
        <UserProfile collapsed={collapsed} />
      </div>
    </Sider>
  );
};

export default Sidebar; 