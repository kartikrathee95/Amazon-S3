import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To get the username from the URL
import { listFilesAndFolders } from '../api';
import FileUpload from './FileManagement/FileUpload';
import FileList from './FileManagement/FileList';
import FolderList from './FileManagement/FolderList';

const UserPage = () => {
    const { username } = useParams();  // Extract username from the URL params
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [allFiles, setAllFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFilesAndFolders = async () => {
        try {
            const { folders, independent_files } = await listFilesAndFolders(username);  // Pass username to API
            setFolders(folders);
            setFiles(independent_files);
            setAllFiles(independent_files);
        } catch (error) {
            console.error('Error fetching files and folders:', error);
        }
    };

    useEffect(() => {
        fetchFilesAndFolders();  // Fetch data when component mounts or username changes
    }, [username]);

    // Filter files based on search query
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        const filteredFiles = allFiles.filter(file => 
            file.filename.toLowerCase().includes(query.toLowerCase())
        );
        setFiles(filteredFiles);
    };

    return (
        <div>
            <h1>{username}'s Files and Folders</h1>

            <FileUpload onUploadSuccess={fetchFilesAndFolders} username={username} />  
            <FolderList folders={folders} username={username} />  

            {/* Search input */}
            <div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}  // Update search query
                    placeholder="Search files..."
                />
            </div>

            <FileList
                files={files}
                onUploadSuccess={fetchFilesAndFolders}
                username={username}  // Pass the username to FileList
            />
        </div>
    );
};

export default UserPage;
