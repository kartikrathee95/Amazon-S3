import React, { useState } from 'react';
import { createFolder } from '../../api';

const CreateFolder = () => {
  const [folderName, setFolderName] = useState('');
  const [parentId, setParentId] = useState('');

  const handleCreateFolder = async () => {
    try {
      await createFolder(folderName, parentId);
      // Handle successful folder creation (e.g., show message or update list)
    } catch (error) {
      console.error('Folder creation failed:', error);
    }
  };

  return (
    <div>
      <h2>Create Folder</h2>
      <input 
        type="text" 
        value={folderName} 
        onChange={(e) => setFolderName(e.target.value)} 
        placeholder="Folder Name" 
      />
      <input 
        type="text" 
        value={parentId} 
        onChange={(e) => setParentId(e.target.value)} 
        placeholder="Parent Folder ID (optional)" 
      />
      <button onClick={handleCreateFolder}>Create Folder</button>
    </div>
  );
};

export default CreateFolder;
