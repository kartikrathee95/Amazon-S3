import React, { useState } from 'react';
import { deleteFolder } from '../../api';

const DeleteFolder = () => {
  const [folderId, setFolderId] = useState('');

  const handleDeleteFolder = async () => {
    try {
      await deleteFolder(folderId);
      // Handle successful deletion (e.g., show message or update list)
    } catch (error) {
      console.error('Folder deletion failed:', error);
    }
  };

  return (
    <div>
      <h2>Delete Folder</h2>
      <input 
        type="text" 
        value={folderId} 
        onChange={(e) => setFolderId(e.target.value)} 
        placeholder="Folder ID" 
      />
      <button onClick={handleDeleteFolder}>Delete Folder</button>
    </div>
  );
};

export default DeleteFolder;
