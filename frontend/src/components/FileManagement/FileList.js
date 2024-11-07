// FileList.js
import React, { useEffect, useState } from 'react';
import { listFiles } from '../../api'; 
import FileItem from './FileItem';

const FileList = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await listFiles(); 
            const independentFiles = response.filter(file => !file.folder_id);
            setFiles(Array.isArray(independentFiles) ? independentFiles : []);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (onUploadSuccess) {
            fetchFiles(); // Refresh the file list on upload success
        }
    }, [onUploadSuccess]);

    return (
        <div>
            <h2>Files</h2>
            {files.length === 0 ? (
                <p>No files available.</p>
            ) : (
                <ul>
                    {files.map((file) => (
                        <FileItem key={file.file_id} file={file} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileList;
