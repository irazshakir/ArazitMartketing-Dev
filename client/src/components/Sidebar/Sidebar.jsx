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
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userData } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', session.user.email)
        .single();
      
      setUserRole(userData?.roles?.role_name);
    }
  };

  const commonMenuItems = [
    { 
      key: 'home',
      icon: <HomeOutlined />, 
      label: 'Dashboard',
      path: role => `/${role}/dashboard`
    },
    { 
      key: 'leads',
      icon: <UserOutlined />, 
      label: 'Leads',
      path: role => `/${role}/leads`
    },
    { 
      key: 'conversations',
      icon: <MessageOutlined />, 
      label: 'Conversations',
      path: role => `/${role}/conversations`
    },
    { 
      key: 'analytics',
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      path: role => `/${role}/analytics`
    },
  ];

  const adminSpecificItems = [
    { 
      key: '/admin/users', 
      icon: <TeamOutlined />, 
      label: 'User Management',
      path: '/admin/users'
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      children: [
        { key: '/admin/settings/company', label: 'Company', path: '/admin/settings/company' },
        { key: '/admin/settings/packages', label: 'Packages', path: '/admin/settings/packages' },
        { key: '/admin/settings/rates', label: 'Rates', path: '/admin/settings/rates' }
      ]
    },
  ];

  const getMenuItems = () => {
    let baseItems = commonMenuItems.map(item => ({
      ...item,
      key: item.path(userRole || 'user'),
      path: item.path(userRole || 'user')
    }));

    switch (userRole) {
      case 'admin':
        return [...baseItems, ...adminSpecificItems];
      case 'manager':
        return baseItems;
      default: // user role
        return baseItems;
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