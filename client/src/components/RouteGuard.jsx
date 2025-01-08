import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { message } from 'antd';

const RouteGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setIsAuthenticated(!!currentUser);
        
        if (!currentUser) {
          message.error('Session expired. Please login again.');
        }
      } catch (error) {
        setIsAuthenticated(false);
        message.error('Authentication failed. Please login again.');
      }
    };

    verifySession();
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default RouteGuard; 