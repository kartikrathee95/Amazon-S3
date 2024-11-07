import React, { useState, useEffect } from 'react';
import FileDownload from './FileDownload';  // Assuming FileDownload is a separate component
import { shareFile, rollbackFile, getFileVersions } from '../../api'; 

const FileItem = ({ file, onUploadSuccess, versions, onShowVersions }) => {
    const [sharingFileId, setSharingFileId] = useState(null);
    const [shareUsername, setShareUsername] = useState('');
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [fileVersions, setFileVersions] = useState(versions || []);  // Initialize with passed versions

    // Fetch file versions from API when the file prop changes
    const fetchFileVersions = async () => {
        try {
            const newVersions = await getFileVersions(file.file_id); // Fetch versions for the specific file
            setFileVersions(newVersions); // Update the state with the fetched versions
        } catch (error) {
            console.error('Error fetching file versions:', error);
        }
    };

    useEffect(() => {
        fetchFileVersions();  // Fetch versions when the component mounts or file prop changes
    }, [file]);  // Trigger re-fetch when the file prop changes (such as after upload)

    // Handle the sharing logic
    const handleShare = async () => {
        if (!shareUsername) {
            alert('Please enter a username or email to share with.');
            return;
        }

        try {
            await shareFile(file.file_id, { user_id: shareUsername, access_type: "shared" });  // Share the file
            alert('File shared successfully!');
            setShareUsername('');
            setSharingFileId(null);
            if (onUploadSuccess && typeof onUploadSuccess === 'function') {
                onUploadSuccess();  // Refresh the UI after sharing
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            alert('Failed to share file. Please check the username/email.');
        }
    };

    // Handle rollback logic for a specific file version
    const handleRollback = async (versionNumber) => {
        setIsRollingBack(true);  // Set rolling back state to true
        try {
            await rollbackFile(file.file_id, versionNumber);  // Rollback to the selected version
            alert(`File rolled back to version ${versionNumber}`);
            await fetchFileVersions();  // Re-fetch versions after rollback

            if (onUploadSuccess && typeof onUploadSuccess === 'function') {
                onUploadSuccess();  // Refresh the UI after rollback
            }
        } catch (error) {
            console.error('Error rolling back file:', error);
            alert('Failed to rollback file');
        } finally {
            setIsRollingBack(false);  // Reset rolling back state
        }
    };

    return (
        <li>
            <div>
                {/* Display the file name */}
                <h3>{file.filename}</h3>  {/* Ensure the filename is passed */}
            </div>

            {/* Ensure file_id is passed correctly to FileDownload */}
            <FileDownload fileId={file.file_id} />  {/* Ensure this is passed correctly */}

            {/* Select Action Dropdown */}
            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'share') {
                        setSharingFileId(file.file_id);  // Enable sharing if selected
                    } else {
                        setSharingFileId(null);  // Disable sharing if another option is selected
                    }
                }}
            >
                <option value="">Select Action</option>
                <option value="download">Download</option>
                <option value="share">Share</option>
            </select>

            {/* Conditional rendering for the sharing input */}
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
                    <p>No versions available.</p>  // If no versions, show this message
                )}
            </div>
        </li>
    );
};

export default FileItem;
