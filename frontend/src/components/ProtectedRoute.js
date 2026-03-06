import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user && !isAuthenticated) {
      try {
        const parsedUser = JSON.parse(user);
        const store = useAuthStore.getState();
        store.setAuth(parsedUser, token);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      }
    }
  }, [isAuthenticated]);

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
