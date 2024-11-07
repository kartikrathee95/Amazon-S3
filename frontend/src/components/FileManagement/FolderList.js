import React, { useState } from 'react';
import FileItem from './FileItem'; // Import the new FileItem component

const FolderList = ({ folders, onUploadSuccess }) => {
    const [openFolders, setOpenFolders] = useState({});

    const toggleFolder = (folderId) => {
        setOpenFolders((prev) => ({
            ...prev,
            [folderId]: !prev[folderId],
        }));
    };

    return (
        <div>
            <h2>Folders</h2>
            {folders.length === 0 ? (
                <p>No folders available.</p>
            ) : (
                folders.map((folder) => (
                    <div key={folder.folder_id}>
                        <div onClick={() => toggleFolder(folder.folder_id)}>
                            {folder.folder_name} {openFolders[folder.folder_id] ? '-' : '+'}
                        </div>
                        {openFolders[folder.folder_id] && (
                            <ul>
                                {folder.files.map((file) => (
                                    <FileItem 
                                        key={file.file_id} 
                                        file={file} 
                                        isInFolder={true}  // Mark files as part of a folder
                                        onUploadSuccess={onUploadSuccess} 
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default FolderList;
