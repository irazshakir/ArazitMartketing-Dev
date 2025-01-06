import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar/Sidebar';
import Users from './pages/Users';
import Invites from './pages/Invites';
import InactiveUsers from './pages/InactiveUsers';
import Teams from './pages/Teams';
import Roles from './pages/Roles';
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
            <Route path="/users/invites" element={<Invites />} />
            <Route path="/users/inactive" element={<InactiveUsers />} />
            <Route path="/users/teams" element={<Teams />} />
            <Route path="/users/roles" element={<Roles />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
