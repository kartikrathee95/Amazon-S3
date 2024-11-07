import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    <Router>
      <Routes>
        <Route path="/homepage" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/user/:username/upload" element={<FileUpload />} />
        <Route path="/user/:username/download/:fileId" element={<FileDownload />} />
        <Route path="/user/:username/files" element={<FileList />} />
        <Route path="/user/:username/folders" element={<FolderList />} />
        
      </Routes>
    </Router>
  );
};

export default App;
