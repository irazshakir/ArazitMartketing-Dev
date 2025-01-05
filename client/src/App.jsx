import { Layout } from 'antd';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  return (
    <Layout>
      <Sidebar />
      <Layout className="min-h-screen bg-gray-50">
        {/* Your main content will go here */}
      </Layout>
    </Layout>
  );
}

export default App;
