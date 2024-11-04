import axios from 'axios';
import { getGlobalToken } from './store'; // Make sure this function retrieves the latest token

const API_BASE_URL = 'http://localhost:8000/S3';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Register User
export const registerUser = async (params) => {

  try {
    const response = await apiClient.post('/auth/oauth/register', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.Error || 'Registration failed. Please try again.');
  }
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login'; // Redirect to login
};

// User Login
export const loginUser = async (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const token = getGlobalToken(); 

  return await apiClient.post('/auth/oauth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`, 
    },
  });
};

// File Upload
export const uploadFile = async (file, folderName) => {
  const token = getGlobalToken();
  const base64File = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; 
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // Read the file as base64
  });

  const payload = {
    file: base64File,
    folder_name: folderName || null,
  };
  console.log(payload);
  return await apiClient.post('/files/upload', payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};
// List Files
export const listFiles = async () => {
  const token = getGlobalToken(); 
  const response = await apiClient.get('/files', {
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });

  return response.data; 
};

// Download File
export const downloadFile = async (fileId) => {
  const token = getGlobalToken(); 
  const response = await apiClient.get(`/files/download/${fileId}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });
  return response; 
};

// Create Folder
export const createFolder = async (folderName, parentId) => {
  const token = getGlobalToken(); 

  return await apiClient.post('/folders', { folder_name: folderName, parent_id: parentId }, {
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });
};

// List Folders
export const listFolders = async () => {
  const token = getGlobalToken(); 
  const response = await apiClient.get('/folders', {
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });
  return response; 
};

export const listFilesAndFolders = async () => {
  const token = getGlobalToken();
  const response = await apiClient.get('/files-and-folders', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data;
};
// Delete Folder
export const deleteFolder = async (folderId) => {
  const token = getGlobalToken(); 

  return await apiClient.delete(`/folders/${folderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });
};

// Get Usage Analytics
export const getUsageAnalytics = async () => {
  const token = getGlobalToken(); 

  const response = await apiClient.get('/Analytics', {
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  });

  return response.data; 
};

// Share File
export const shareFile = async (fileId, shareDetails) => {
  const token = getGlobalToken(); 

  return await apiClient.post(`http://localhost:8000/S3/share_file/${fileId}`, shareDetails, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
  });
};
