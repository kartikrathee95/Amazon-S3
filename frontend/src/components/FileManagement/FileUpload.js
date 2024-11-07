import React, { useState } from 'react';
import { uploadFile } from '../../api';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [originalFileName, setOriginalFileName] = useState('');  // State to store the original file name

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            console.error('No file selected');
            alert('Please select a file to upload');
            return;
        }

        try {
            // Upload the file
            const response = await uploadFile(file, folderName ? folderName : null);
            console.log('File uploaded successfully');
            alert('File uploaded successfully');

            // Set the original filename after successful upload (from response)
            setOriginalFileName(response.original_filename || file.name);  // Handle versioned filename

            onUploadSuccess(); // Refresh the file list on success
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
