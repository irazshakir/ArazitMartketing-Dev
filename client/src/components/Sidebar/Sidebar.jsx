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

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      key: 'home', 
      icon: <HomeOutlined />, 
      label: 'Home' 
    },
    { 
      key: 'conversations', 
      icon: <MessageOutlined />, 
      label: 'Conversations' 
    },
    { 
      key: 'leads', 
      icon: <UserOutlined />, 
      label: 'Leads' 
    },
    { 
      key: 'analytics', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      children: [
        { key: 'reports', label: 'Reports' },
        { key: 'logs', label: 'Logs' }
      ]
    },
    { 
      key: 'invoices', 
      icon: <FileTextOutlined />, 
      label: 'Invoices' 
    },
    { 
      key: 'accounts', 
      icon: <TeamOutlined />, 
      label: 'Accounts' 
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      children: [
        { key: 'company', label: 'Company' },
        { key: 'accounts', label: 'Accounts' },
        { key: 'readyMadePackages', label: 'Ready Made Packages' },
        { key: 'hotelRates', label: 'Hotel Rates' }
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
        items={menuItems}
        className="border-r-0"
        inlineCollapsed={collapsed}
        style={{
          '.ant-menu-item-selected': {
            backgroundColor: theme.colors.primaryActive,
            color: theme.colors.primary,
          },
          '.ant-menu-item:hover, .ant-menu-submenu-title:hover': {
            backgroundColor: theme.colors.primaryHover + ' !important',
            color: theme.colors.primary,
          },
          '.ant-menu-item-active, .ant-menu-submenu-active': {
            color: theme.colors.primary,
          }
        }}
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