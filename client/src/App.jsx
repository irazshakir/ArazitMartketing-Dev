import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Spin, Layout } from 'antd';
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
import RouteGuard from './components/RouteGuard';
import GeneralSettings from './pages/Settings/general';
import Products from './pages/Settings/products';
import Stages from './pages/Settings/stages';
import LeadSources from './pages/Settings/LeadSources';
import LeadEdit from './pages/Leads/Edit';
import Invoices from './pages/Invoices/Index';
import Accounts from './pages/Accounts/Index';
import CompanyBranches from './pages/Settings/CompanyBranches';
import Reports from './pages/Reports/Reports';
import UserReports from './pages/UserDashboard/UserReports/UserReports';
import UserLeadIndex from './pages/UserDashboard/UserLeads/UserLeadIndex';
import UserConversationsIndex from './pages/UserDashboard/UserConversations/UserConversationsIndex';
import UserLeadEdit from './pages/UserDashboard/UserLeads/UserLeadEdit';
import CannedMessages from './pages/CannedMessages/CannedMessages';
import TemplateMessages from './pages/TemplateMessages/TemplateMessages';
import Sidebar from './components/Sidebar/Sidebar';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Function to check if we're on the login page
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

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

  // Define the toggle function
  const handleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  // Debug effect to monitor collapsed state changes
  useEffect(() => {
    console.log('Collapsed state changed to:', collapsed);
  }, [collapsed]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Only render Sidebar if not on login page and user is authenticated */}
      {!isLoginPage && isAuthenticated() && (
        <Sidebar 
          collapsed={collapsed} 
          onCollapse={handleCollapse}
        />
      )}
      <Layout style={{ 
        marginLeft: (!isLoginPage && isAuthenticated()) ? (collapsed ? 80 : 250) : 0,
        minHeight: '100vh',
        padding: 0,
        transition: 'all 0.2s'
      }}>
        <Layout.Content style={{ 
          padding: 0,
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#fff'
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <RouteGuard>
                  <ProtectedRoute allowedRoles={['admin']} session={session} userRole={userRole}>
                    <AdminDashboard />
                  </ProtectedRoute>
                </RouteGuard>
              }
            >
              <Route path="dashboard" element={<AdminDashboardContent />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:id" element={<LeadEdit />} />
              <Route path="conversations" element={<Conversations />} />
              
              {/* Add the invoices route here */}
              <Route path="invoices" element={<Invoices />} />
              
              {/* Settings routes */}
              <Route path="settings">
                <Route path="general" element={<GeneralSettings />} />
                <Route path="products" element={<Products />} />
                <Route path="stages" element={<Stages />} />
                <Route path="lead-sources" element={<LeadSources />} />
                <Route path="company-branches" element={<CompanyBranches />} />
                <Route path="canned-messages" element={<CannedMessages />} />
                <Route path="template-messages" element={<TemplateMessages />} />
              </Route>

              {/* User Management Routes */}
              <Route path="users">
                <Route index element={<Users />} />
                <Route path="invites" element={<UserInvites />} />
                <Route path="inactive" element={<InactiveUsers />} />
                <Route path="teams" element={<Teams />} />
                <Route path="roles" element={<Roles />} />
              </Route>
              
              <Route path="accounts" element={<Accounts />} />
              
              <Route path="reports" element={<Reports />} />
              
              {/* ... other admin routes ... */}
            </Route>

            {/* Manager Routes */}
            <Route 
              path="/manager" 
              element={
                <RouteGuard>
                  <ProtectedRoute allowedRoles={['manager']} session={session} userRole={userRole}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                </RouteGuard>
              }
            >
              <Route path="dashboard" element={<ManagerDashboardContent />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:id" element={<LeadEdit />} />
              <Route path="conversations" element={<Conversations />} />
            </Route>

            {/* User Routes */}
            <Route 
              path="/user" 
              element={
                <RouteGuard>
                  <ProtectedRoute allowedRoles={['user']} session={session} userRole={userRole}>
                    <UserDashboard />
                  </ProtectedRoute>
                </RouteGuard>
              }
            >
              <Route path="dashboard" element={<UserDashboardContent />} />
              <Route path="leads" element={<UserLeadIndex />} />
              <Route path="leads/:id" element={<UserLeadEdit />} />
              <Route path="conversations" element={<UserConversationsIndex />} />
              <Route path="reports" element={<UserReports />} />
            </Route>

            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={
              <Navigate to={session ? `/${userRole}/dashboard` : '/login'} replace />
            } />
          </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default App;
