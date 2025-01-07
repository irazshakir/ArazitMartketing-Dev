import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, session, userRole }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute; 