import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout>
      <Sidebar />
      <Content style={{ marginLeft: '80px', minHeight: '100vh' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;