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
import MainLayout from './layouts/MainLayout';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={<MainLayout />}>
        <Route path="dashboard" element={<AdminDashboardContent />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadEdit />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="settings">
          <Route path="general" element={<GeneralSettings />} />
          <Route path="products" element={<Products />} />
          <Route path="stages" element={<Stages />} />
          <Route path="lead-sources" element={<LeadSources />} />
          <Route path="company-branches" element={<CompanyBranches />} />
          <Route path="canned-messages" element={<CannedMessages />} />
          <Route path="template-messages" element={<TemplateMessages />} />
        </Route>
        <Route path="users">
          <Route index element={<Users />} />
          <Route path="invites" element={<UserInvites />} />
          <Route path="inactive" element={<InactiveUsers />} />
          <Route path="teams" element={<Teams />} />
          <Route path="roles" element={<Roles />} />
        </Route>
        <Route path="accounts" element={<Accounts />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Protected User Routes */}
      <Route path="/user" element={<MainLayout />}>
        <Route path="dashboard" element={<UserDashboardContent />} />
        <Route path="conversations" element={<UserConversationsIndex />} />
        <Route path="leads" element={<UserLeadIndex />} />
        <Route path="leads/:id" element={<UserLeadEdit />} />
        <Route path="reports" element={<UserReports />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={
        <Navigate to={session ? `/${userRole}/dashboard` : '/login'} replace />
      } />
    </Routes>
  );
};

export default App;
