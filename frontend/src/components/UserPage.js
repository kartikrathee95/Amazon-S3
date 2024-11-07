import React, { useEffect, useState } from 'react';
import { listFilesAndFolders } from '../api'; 
import FileUpload from './FileManagement/FileUpload';
import FileList from './FileManagement/FileList';
import FolderList from './FileManagement/FolderList'; 

const UserPage = () => {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);

    const fetchFilesAndFolders = async () => {
        try {
            const { folders, independent_files } = await listFilesAndFolders();
            setFolders(folders);
            setFiles(independent_files); // Ensure independent files are set here
        } catch (error) {
            console.error('Error fetching files and folders:', error);
        }
    };

    useEffect(() => {
        fetchFilesAndFolders(); 
    }, []);

    const handleUploadSuccess = () => {
        fetchFilesAndFolders(); // Refresh files and folders after upload
    };

    return (
        <div>
            <h1>Your Files and Folders</h1>
            <FileUpload onUploadSuccess={handleUploadSuccess} /> {/* Only here */}
            <FolderList folders={folders} /> {/* Pass folders to FolderList */}
            <FileList onUploadSuccess={handleUploadSuccess} /> {/* Pass files to FileList */}
        </div>
    );
};

export default UserPage;
