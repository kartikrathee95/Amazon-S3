import React from 'react';
import { useAuth } from '../../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Clears user from context and localStorage
    navigate('/login');  // Redirects to the login page
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
