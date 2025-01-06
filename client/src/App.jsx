import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminDashboardContent from './pages/AdminDashboard/Dashboard';
import ManagerDashboardContent from './pages/ManagerDashboard/Dashboard';
import UserDashboardContent from './pages/UserDashboard/Dashboard';
import Leads from './pages/Leads';
import Conversations from './pages/Conversations';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardContent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="conversations" element={<Conversations />} />
      </Route>

      {/* Manager Routes */}
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ManagerDashboardContent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="conversations" element={<Conversations />} />
      </Route>

      {/* User Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboardContent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="conversations" element={<Conversations />} />
      </Route>
    </Routes>
  );
}

export default App;
