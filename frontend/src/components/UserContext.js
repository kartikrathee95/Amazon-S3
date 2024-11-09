import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ username, children }) => {
  const [user, setUser] = useState(username);

  useEffect(() => {
    setUser(username); // Update username when it changes
  }, [username]);

  return (
    <UserContext.Provider value={{ username: user }}>
      {children}
    </UserContext.Provider>
  );
};
