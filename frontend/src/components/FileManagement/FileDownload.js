
import React from 'react';
import { downloadFile } from '../../api';

const FileDownload = ({ fileId }) => {
  const handleDownload = async () => {
    if (!fileId) {
      console.error('File ID is required');
      return;
    }

    try {
      const response = await downloadFile(fileId);
      
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `file_${fileId}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        alert("File downloaded successfully")
      } else {
        console.error('Failed to download file: Status', response.status);
      }
    } catch (error) {
      console.error('File download failed:', error);
    }
  };

  return (
    <button onClick={handleDownload}>Download</button>
  );
};

export default FileDownload;
