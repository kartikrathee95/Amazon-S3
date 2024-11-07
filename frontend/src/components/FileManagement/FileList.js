import React, { useEffect, useState } from 'react';
import { listFiles, getFileVersions, downloadFile } from '../../api';
import FileItem from './FileItem';

const FileList = ({ files, onFilesFound, onResetSearch, onUploadSuccess }) => {
    const [fileVersions, setFileVersions] = useState({});
    const [loading, setLoading] = useState(false);  

    // Fetch files initially (non-search)
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await listFiles();
            const independentFiles = response.filter(file => !file.folder_id); // Filter out folders
            onFilesFound(independentFiles);  // Pass to parent for setting files
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);  // Stop loading after fetch
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Fetch file versions for a specific file
    const fetchFileVersions = async (fileId) => {
        try {
            const response = await getFileVersions(fileId);
            setFileVersions((prev) => ({
                ...prev,
                [fileId]: response.versions || [],
            }));
        } catch (error) {
            console.error('Error fetching file versions:', error);
        }
    };

    // Handle file download
    const handleDownload = async (fileId) => {
        try {
            await downloadFile(fileId);  // Call downloadFile API
            console.log('File downloaded successfully');
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    // Handle rollback after versioning
    const handleRollbackSuccess = async (fileId) => {
        await fetchFileVersions(fileId);  // Re-fetch versions after rollback
    };

    return (
        <div>
            <h2>Files</h2>

            {/* Files List */}
            {loading ? (
                <p>Loading...</p>  // Loading indicator
            ) : files.length === 0 ? (
                <p>No files available.</p>  // Display message if no files
            ) : (
                <ul>
                    {files.map((file) => {
                        return (
                            <FileItem 
                                key={file.file_id}  // Ensure a unique key for each item
                                file={file}  // Ensure the file object is passed correctly here
                                onUploadSuccess={onUploadSuccess}
                                onShowVersions={() => fetchFileVersions(file.file_id)}
                                versions={fileVersions[file.file_id] || []}  // Pass versions if available
                                onRollbackSuccess={handleRollbackSuccess}
                                onDownload={() => handleDownload(file.file_id)}  // Pass file_id to download
                            />
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default FileList;
