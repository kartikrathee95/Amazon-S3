// UserPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FileUpload from './FileManagement/FileUpload';
import FileList from './FileManagement/FileList';
import FolderList from './FileManagement/FolderList';
import { listFilesAndFolders } from '../api';
import './userpage.css';

const UserPage = () => {
  const { username } = useParams();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFilesAndFolders = async () => {
    try {
      const { folders, independent_files } = await listFilesAndFolders(username);
      setFolders(folders);
      setFiles(independent_files);
      setAllFiles(independent_files);
    } catch (error) {
      console.error('Error fetching files and folders:', error);
    }
  };

  useEffect(() => {
    fetchFilesAndFolders();
  }, [username]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const filteredFiles = allFiles.filter(file =>
      file.filename.toLowerCase().includes(query.toLowerCase())
    );
    setFiles(filteredFiles);
  };

  return (
    <div className="userpage-container">
      <div className="userpage-header">
        <h1>{username}'s Files and Folders</h1>
      </div>

      <div className="userpage-section upload-section">
        <FileUpload onUploadSuccess={fetchFilesAndFolders} username={username} />
      </div>

      <div className="search-section">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-box"
          placeholder="Search files..."
        />
      </div>

      <div className="userpage-section">
        <FolderList folders={folders} username={username} />
        <FileList files={files} onUploadSuccess={fetchFilesAndFolders} username={username} />
      </div>
    </div>
  );
};

export default UserPage;
