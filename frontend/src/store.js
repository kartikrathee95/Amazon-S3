let userTokens = {};

// Load tokens from localStorage when the script is loaded
const loadTokensFromLocalStorage = () => {
  const storedTokens = localStorage.getItem('user_tokens');
  if (storedTokens) {
    try {
      userTokens = JSON.parse(storedTokens);
      // Ensure the structure is always { username: token }
      if (typeof userTokens !== 'object' || Array.isArray(userTokens)) {
        userTokens = {};  // Reset if data structure is corrupted
      }
    } catch (error) {
      console.error('Error parsing tokens from localStorage', error);
      userTokens = {}; // Reset if JSON parsing fails
    }
  }
};

// Save the userTokens object to localStorage
const saveTokensToLocalStorage = () => {
  try {
    localStorage.setItem('user_tokens', JSON.stringify(userTokens));
  } catch (error) {
    console.error('Error saving tokens to localStorage', error);
  }
};

// Initial load from localStorage
loadTokensFromLocalStorage();

// Set a global token for a specific username
export const setGlobalToken = (username, token) => {
  if (typeof username === 'string' && typeof token === 'string') {
    userTokens[username] = token;  // Store token in { username: token }
    saveTokensToLocalStorage();
  } else {
    console.error('Invalid input: username and token must be strings');
  }
};

// Get the global token for a specific username
export const getGlobalToken = (username) => {
  if (typeof username !== 'string') {
    console.error('Invalid input: username must be a string');
    return null;
  }

  if (userTokens[username]) {
    return userTokens[username];  // Return token from memory
  }

  const storedTokens = localStorage.getItem('user_tokens');
  if (storedTokens) {
    try {
      userTokens = JSON.parse(storedTokens);
      return userTokens[username] || null;
    } catch (error) {
      console.error('Error parsing tokens from localStorage', error);
      return null;
    }
  }

  return null;
};

// Clear the token for a specific username
export const clearGlobalToken = (username) => {
  if (typeof username !== 'string') {
    console.error('Invalid input: username must be a string');
    return;
  }

  delete userTokens[username];
  saveTokensToLocalStorage();
};

// Clear all tokens
export const clearAllTokens = () => {
  userTokens = {};
  localStorage.removeItem('user_tokens');
};
