import React, { useEffect, useState } from 'react';
import { listFiles, getFileVersions, downloadFile } from '../../api';
import FileItem from './FileItem';
import { useUser } from '../UserContext';

const FileList = ({ files, onFilesFound, onResetSearch, onUploadSuccess }) => {
    const { username } = useUser();
    const [fileVersions, setFileVersions] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch files initially (non-search)
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await listFiles(username);
            const independentFiles = response.filter(file => !file.folder_id);
            onFilesFound(independentFiles);  // Pass to parent for setting files
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle file versions fetch
    const fetchFileVersions = async (fileId) => {
        try {
            const response = await getFileVersions(fileId, username);
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
            await downloadFile(fileId); 
            console.log('File downloaded successfully');
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    // Handle rollback after versioning
    const handleRollbackSuccess = async (fileId) => {
        await fetchFileVersions(fileId);  // Re-fetch versions after rollback
    };

    // Handle file deletion and update the file list
    const handleDeleteSuccess = (deletedFileId) => {
        const updatedFiles = files.filter(file => file.file_id !== deletedFileId);
        onFilesFound(updatedFiles);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div>
            <h2>Files</h2>

            {/* Files List */}
            {loading ? (
                <p>Loading...</p> 
            ) : files.length === 0 ? (
                <p>No files available.</p>
            ) : (
                <ul>
                    {files.map((file) => {
                        return (
                            <FileItem
                                key={file.file_id} 
                                file={file}
                                onUploadSuccess={onUploadSuccess}
                                onShowVersions={() => fetchFileVersions(file.file_id)}
                                versions={fileVersions[file.file_id] || []}
                                onRollbackSuccess={handleRollbackSuccess}
                                onDownload={() => handleDownload(file.file_id)}
                                onDeleteSuccess={handleDeleteSuccess}
                            />
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default FileList;
