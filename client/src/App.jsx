import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar/Sidebar';
import Users from './pages/Users';
import Home from './pages/Home';

const { Content } = Layout;

function App() {
  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Content className="site-layout-background" style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
