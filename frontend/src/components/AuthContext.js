// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage (if exists)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Persist user to localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage on logout
  };

  useEffect(() => {
    // On app mount, check if the user is already in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
