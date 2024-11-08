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

/// File Upload
export const uploadFile = async (file, folderName) => {
  const token = getGlobalToken();
  
  // Handle empty file
  if (file.size === 0) {
    console.log("Uploading empty file...");
    return await apiClient.post('/files/upload', {
      file: "",
      folder_name: folderName || null,
      file_name: file.name,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Base64 encoding of the file
  const base64File = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      // Check if the result is valid (it's a valid Data URL)
      if (result && typeof result === 'string' && result.startsWith('data:')) {
        const base64String = result.split(',')[1]; // Extract base64 string
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));

    reader.readAsDataURL(file); // Read the file as base64
  });

  const payload = {
    file: base64File, // Send the base64 content for non-empty files
    folder_name: folderName || null,
    file_name: file.name,
  };

  console.log('Uploading file with payload:', payload);

  try {
    return await apiClient.post('/files/upload', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
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
  console.log(response.data);
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

export const searchFiles = async ({ keyword, file_type, created_after, created_before }) => {
  const token = getGlobalToken();
  try {
      const response = await apiClient.get('/files/search', {
          params: {
              keyword,
              file_type,
              created_after,
              created_before,
          },
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error('Error fetching files based on search:', error);
      throw error;
  }
};

export const getFileVersions = async (fileId) => {
  const token = getGlobalToken();
  try {
    const response = await apiClient.get(`/files/${fileId}/versions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching file versions:', error);
    throw error;
  }
};

export const rollbackFile = async (fileId, versionNumber) => {
  const token = getGlobalToken();
  try {
    await apiClient.post(
      '/files/rollback',
      { file_id: fileId, version_number: versionNumber },
      {
        headers: {
          "Content-Type":"application/json",
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Error rolling back file:', error);
    throw error;
  }
};
