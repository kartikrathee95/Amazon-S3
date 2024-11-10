import React, { useState, useEffect } from 'react';
import { deleteFile, shareFile, rollbackFile, getFileVersions } from '../../api';
import { useUser } from '../UserContext';
import FileDownload from './FileDownload';

const FileItem = ({ file, onUploadSuccess, versions, onShowVersions, onRollbackSuccess, onDeleteSuccess }) => {
    const [sharingFileId, setSharingFileId] = useState(null);
    const [shareUsername, setShareUsername] = useState('');
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [fileVersions, setFileVersions] = useState(versions || []);
    const { username } = useUser();

    // Fetch file versions from API when the file prop changes
    const fetchFileVersions = async () => {
        try {
            const newVersions = await getFileVersions(file.file_id, username);
            setFileVersions(newVersions);
        } catch (error) {
            console.error('Error fetching file versions:', error);
        }
    };

    useEffect(() => {
        fetchFileVersions();
    }, [file]);

    // Handle the sharing logic
    const handleShare = async () => {
        if (!shareUsername) {
            alert('Please enter a username or email to share with.');
            return;
        }

        try {
            await shareFile(file.file_id, { user_id: shareUsername, access_type: "shared" }, username);
            alert('File shared successfully!');
            setShareUsername('');
            setSharingFileId(null);
            if (onUploadSuccess && typeof onUploadSuccess === 'function') {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            alert('Failed to share file. Please check the username/email.');
        }
    };

    // rollback for a specific file version
    const handleRollback = async (versionNumber) => {
        setIsRollingBack(true);
        try {
            await rollbackFile(file.file_id, versionNumber, username);  // Rollback to the selected version
            alert(`File rolled back to version ${versionNumber}`);
            await fetchFileVersions();
            if (onRollbackSuccess && typeof onRollbackSuccess === 'function') {
                onRollbackSuccess(file.file_id);
            }
        } catch (error) {
            console.error('Error rolling back file:', error);
            alert('Failed to rollback file');
        } finally {
            setIsRollingBack(false);
        }
    };

    // Handle delete action
    const handleDelete = async () => {
        console.log('Delete button clicked for file:', file.filename, 'ID:', file.file_id);
        const confirmDelete = window.confirm('Are you sure you want to delete this file?');
        if (!confirmDelete) return;

        try {
            const response = await deleteFile(file.file_id, username);
            console.log('Delete response:', response);
            alert('File deleted successfully!');
            if (onDeleteSuccess && typeof onDeleteSuccess === 'function') {
                onDeleteSuccess(file.file_id);  // Refresh the file list after deletion
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file. Please try again.');
        }
    };

    return (
        <li>
            <h3>{file.filename}</h3>
            <FileDownload fileId={file.file_id} />
            
            {/* Select Action Dropdown */}
            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'share') {
                        setSharingFileId(file.file_id);
                    } else if (value === 'delete') {
                        handleDelete();
                    } else {
                        setSharingFileId(null);
                    }
                }}
            >
                <option value="">Select Action</option>
                <option value="download">Download</option>
                <option value="share">Share</option>
                <option value="delete">Delete</option>  {/* Added delete option */}
            </select>

            {/*Rendering for the sharing input */}
            {sharingFileId === file.file_id && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={shareUsername}
                        onChange={(e) => setShareUsername(e.target.value)}
                        required
                    />
                    <button onClick={handleShare}>Share</button>
                </div>
            )}

            {/* File Versions List */}
            <div>
                <h4>File Versions</h4>
                {(fileVersions || []).length > 0 ? (
                    <ul>
                        {fileVersions.map((version) => (
                            <li key={version.version_number}>
                                Version {version.version_number}
                                <button
                                    onClick={() => handleRollback(version.version_number)}
                                    disabled={isRollingBack}
                                >
                                    Rollback
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No versions available.</p> 
                )}
            </div>
        </li>
    );
};

export default FileItem;
