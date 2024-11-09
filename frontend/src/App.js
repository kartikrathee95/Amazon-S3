// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { UserProvider } from './components/UserContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import FileUpload from './components/FileManagement/FileUpload';
import FileDownload from './components/FileManagement/FileDownload';
import FileList from './components/FileManagement/FileList';
import Home from './components/Home';
import UserPage from './components/UserPage';
import FolderList from './components/FileManagement/FolderList';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/homepage" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/user/:username" element={<UserWithProvider component={<UserPage />} />} />
          <Route path="/user/:username/upload" element={<UserWithProvider component={<FileUpload />} />} />
          <Route path="/user/:username/download/:fileId" element={<UserWithProvider component={<FileDownload />} />} />
          <Route path="/user/:username/files" element={<UserWithProvider component={<FileList />} />} />
          <Route path="/user/:username/folders" element={<UserWithProvider component={<FolderList />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const UserWithProvider = ({ component }) => {
  const {username} = useParams(); // Get the username from the URL

  return (
    <UserProvider username={username}> {/* Pass username as prop */}
      {component}
    </UserProvider>
  );
};

export default App;
