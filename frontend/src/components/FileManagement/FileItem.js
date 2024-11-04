import React, { useState } from 'react';
import FileDownload from './FileDownload';
import { shareFile } from '../../api';

const FileItem = ({ file, onUploadSuccess }) => {
    const [sharingFileId, setSharingFileId] = useState(null);
    const [shareUsername, setShareUsername] = useState('');

    const handleShare = async () => {
        if (!shareUsername) {
            alert('Please enter a username or email to share with.');
            return;
        }

        try {
            await shareFile(file.file_id, { user_id: shareUsername, access_type: "shared" });
            alert('File shared successfully!');
            setShareUsername('');
            setSharingFileId(null);
            if (onUploadSuccess && typeof onUploadSuccess === 'function'){
            onUploadSuccess(); // Call to refresh file list on success
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            alert('Failed to share file. Please check the username/email.');
        }
    };

    return (
        <li>
            {file.filename}
            <FileDownload fileId={file.file_id} />
            <select
                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'share') {
                        setSharingFileId(file.file_id);
                    } else {
                        setSharingFileId(null);
                    }
                }}
            >
                <option value="">Select Action</option>
                <option value="download">Download</option>
                <option value="share">Share</option>
            </select>
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
        </li>
    );
};

export default FileItem;
