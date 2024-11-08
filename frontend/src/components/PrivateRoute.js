import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ element, ...rest }) => {
  const { user } = useAuth();

  return user ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;