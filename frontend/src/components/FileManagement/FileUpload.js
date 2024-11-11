import React, { useState, useRef } from 'react';
import { uploadFile } from '../../api';
import { useUser } from '../UserContext';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [originalFileName, setOriginalFileName] = useState('');
    const { username } = useUser();
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            console.error('No file selected');
            alert('Please select a file to upload');
            return;
        }

        try {
            // Upload the file
            const response = await uploadFile(file, folderName ? folderName : null, username);
            console.log('File uploaded successfully');
            alert('File uploaded successfully');

            setOriginalFileName(response.original_filename || file.name);

            onUploadSuccess();  // Refresh the file list on success

            setFile(null);
            setFolderName('');
            fileInputRef.current.value = '';

        } catch (error) {
            console.error('File upload failed:', error.response ? error.response.data : error);
        }
    };

    return (
        <div>
            <h2>Upload File</h2>
            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Folder Name (optional)"
                />
                <button type="submit">Upload</button>
            </form>

            {originalFileName && (
                <div>
                    <h3>Uploaded File: {originalFileName}</h3>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
