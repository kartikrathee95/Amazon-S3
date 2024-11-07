import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileList from './FileList';
import { listFiles, getFileVersions, downloadFile } from '../../api'; // Mock the API functions
import FileItem from './FileItem'; // Ensure FileItem component is imported correctly

// Mock the API functions
jest.mock('../../api', () => ({
  listFiles: jest.fn(),
  getFileVersions: jest.fn(),
  downloadFile: jest.fn(),
}));

// Mock the FileItem component
jest.mock('./FileItem', () => ({
  __esModule: true,
  default: ({ file, onShowVersions, onDownload }) => (
    <div>
      <div>{file.file_name}</div>
      <button onClick={onShowVersions}>Show Versions</button>
      <button onClick={onDownload}>Download</button>
    </div>
  ),
}));

describe('FileList Component', () => {
  const mockOnFilesFound = jest.fn();
  const mockOnUploadSuccess = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should render loading state while fetching files', async () => {
    listFiles.mockResolvedValueOnce([]); // Mock an empty file response

    render(<FileList files={[]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Initially, it should show "Loading..."
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should render files after fetching', async () => {
    const mockFiles = [
      { file_id: '1', file_name: 'file1.txt', folder_id: null },
      { file_id: '2', file_name: 'file2.txt', folder_id: null },
    ];

    listFiles.mockResolvedValueOnce(mockFiles); // Mock the file list response

    render(<FileList files={[]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Wait for the files to be loaded
    await waitFor(() => expect(mockOnFilesFound).toHaveBeenCalledWith(mockFiles));

    // Verify that files are rendered
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
  });

  it('should display "No files available" if there are no files', async () => {
    listFiles.mockResolvedValueOnce([]); // Mock an empty file list response

    render(<FileList files={[]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Wait for the loading state to disappear
    await waitFor(() => expect(screen.queryByText(/loading.../i)).toBeNull());

    // Ensure "No files available" is shown
    expect(screen.getByText('No files available.')).toBeInTheDocument();
  });

  it('should fetch file versions when "Show Versions" button is clicked', async () => {
    const mockFile = { file_id: '1', file_name: 'file1.txt', folder_id: null };
    const mockVersions = { versions: ['v1', 'v2', 'v3'] };

    // Mock the APIs
    listFiles.mockResolvedValueOnce([mockFile]);
    getFileVersions.mockResolvedValueOnce(mockVersions);

    render(<FileList files={[]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Wait for files to load
    await waitFor(() => expect(mockOnFilesFound).toHaveBeenCalled());

    // Click on "Show Versions" button
    const showVersionsButton = screen.getByText('Show Versions');
    fireEvent.click(showVersionsButton);

    // Check if the versions were fetched and stored
    await waitFor(() => expect(getFileVersions).toHaveBeenCalledWith(mockFile.file_id));
    expect(getFileVersions).toHaveBeenCalledTimes(1);
  });

  it('should handle file download correctly', async () => {
    const mockFile = { file_id: '1', file_name: 'file1.txt', folder_id: null };

    // Mock the download API
    downloadFile.mockResolvedValueOnce({ status: 200 });

    render(<FileList files={[mockFile]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);

    // Ensure the downloadFile API is called with the correct file ID
    await waitFor(() => expect(downloadFile).toHaveBeenCalledWith(mockFile.file_id));
  });

  it('should call onFilesFound with the fetched file list', async () => {
    const mockFiles = [
      { file_id: '1', file_name: 'file1.txt', folder_id: null },
      { file_id: '2', file_name: 'file2.txt', folder_id: null },
    ];

    listFiles.mockResolvedValueOnce(mockFiles);

    render(<FileList files={[]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Wait for files to be loaded
    await waitFor(() => expect(mockOnFilesFound).toHaveBeenCalledWith(mockFiles));
  });

  it('should handle rollback correctly after file versioning', async () => {
    const mockFile = { file_id: '1', file_name: 'file1.txt', folder_id: null };
    const mockVersions = { versions: ['v1', 'v2', 'v3'] };

    getFileVersions.mockResolvedValueOnce(mockVersions); // Mock file versions API

    render(<FileList files={[mockFile]} onFilesFound={mockOnFilesFound} onResetSearch={jest.fn()} onUploadSuccess={mockOnUploadSuccess} />);

    // Simulate a rollback after versioning
    await waitFor(() => fireEvent.click(screen.getByText('Show Versions')));

    // Ensure that the rollback callback is called
    await waitFor(() => expect(mockOnFilesFound).toHaveBeenCalledWith(mockVersions.versions));
  });
});
