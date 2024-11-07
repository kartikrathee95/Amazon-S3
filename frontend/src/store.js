let globalToken = null;

export const setGlobalToken = (token) => {
  globalToken = token;
  localStorage.setItem('access_token', token); // Persist token in localStorage
};

export const getGlobalToken = () => {
  // First check in memory
  if (globalToken) {
    return globalToken;
  }
  
  const storedToken = localStorage.getItem('access_token');
  if (storedToken) {
    globalToken = storedToken;
    return storedToken;
  }

  return null; 
};

export const clearGlobalToken = () => {
  globalToken = null;
  localStorage.removeItem('access_token');
};
