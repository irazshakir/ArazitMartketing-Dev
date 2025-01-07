import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';
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
import Users from './pages/Users';
import UserInvites from './pages/Users/Invites';
import InactiveUsers from './pages/Users/InactiveUsers';
import Teams from './pages/Users/Teams';
import Roles from './pages/Users/Roles';
import { supabase } from './lib/supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getUserRole(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getUserRole(session.user.email);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserRole = async (email) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('email', email)
        .single();

      if (error) throw error;
      setUserRole(userData.roles.role_name);
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        !session ? <Login /> : <Navigate to={`/${userRole}/dashboard`} replace />
      } />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']} session={session} userRole={userRole}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardContent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="conversations" element={<Conversations />} />
        
        {/* User Management Routes */}
        <Route path="users">
          <Route index element={<Users />} />
          <Route path="invites" element={<UserInvites />} />
          <Route path="inactive" element={<InactiveUsers />} />
          <Route path="teams" element={<Teams />} />
          <Route path="roles" element={<Roles />} />
        </Route>
        
        {/* ... other admin routes ... */}
      </Route>

      {/* Manager Routes */}
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute allowedRoles={['manager']} session={session} userRole={userRole}>
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
          <ProtectedRoute allowedRoles={['user']} session={session} userRole={userRole}>
            <UserDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboardContent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="conversations" element={<Conversations />} />
      </Route>

      {/* Redirect root to appropriate dashboard */}
      <Route path="/" element={
        <Navigate to={session ? `/${userRole}/dashboard` : '/login'} replace />
      } />
    </Routes>
  );
}

export default App;
