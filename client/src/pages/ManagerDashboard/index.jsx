import { Layout } from 'antd';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const ManagerDashboard = () => {
  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Content className="p-6 min-h-screen bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerDashboard; 