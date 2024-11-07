import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from './FileUpload'; // Adjust the import path if necessary
import { uploadFile } from '../../api'; // Mock the API function

// Mock the uploadFile API function
jest.mock('../../api', () => ({
  uploadFile: jest.fn(),
}));

describe('FileUpload Component', () => {
  
  it('should render the file upload form', () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    // Check if the file input and upload button are rendered
    expect(screen.getByLabelText(/upload/i)).toBeInTheDocument();
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });

  it('should allow file selection and set the file state', () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verify that the file has been selected
    expect(fileInput.files[0]).toBe(file);
  });

  it('should call uploadFile when the form is submitted', async () => {
    const mockOnUploadSuccess = jest.fn();

    // Mock successful upload response
    const mockResponse = { original_filename: 'example.txt' };
    uploadFile.mockResolvedValue(mockResponse);

    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const folderInput = screen.getByPlaceholderText(/folder name/i);
    fireEvent.change(folderInput, { target: { value: 'Test Folder' } });

    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);

    // Wait for the upload to complete and check if uploadFile was called with the correct arguments
    await waitFor(() => expect(uploadFile).toHaveBeenCalledWith(file, 'Test Folder'));

    // Verify that the file upload success callback was called
    expect(mockOnUploadSuccess).toHaveBeenCalled();
    expect(screen.getByText(/uploaded file: example.txt/i)).toBeInTheDocument();
  });

  it('should handle file upload failure', async () => {
    const mockOnUploadSuccess = jest.fn();

    // Mock uploadFile to simulate failure
    const mockError = new Error('Network Error');
    uploadFile.mockRejectedValue(mockError);

    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);

    // Ensure that the upload fails silently (for now, we just check for error handling)
    await waitFor(() => expect(uploadFile).toHaveBeenCalled());

    // Error handling should happen inside the component
    expect(console.error).toHaveBeenCalledWith('File upload failed:', mockError);
  });

  it('should display an alert when no file is selected and upload button is clicked', () => {
    render(<FileUpload onUploadSuccess={jest.fn()} />);

    const uploadButton = screen.getByText(/upload/i);

    // Mock window.alert to test alert behavior
    global.alert = jest.fn();

    fireEvent.click(uploadButton);

    // Ensure that the alert is shown when no file is selected
    expect(global.alert).toHaveBeenCalledWith('Please select a file to upload');
  });

  it('should update the filename displayed after a successful upload', async () => {
    const mockOnUploadSuccess = jest.fn();

    // Mock successful upload response with a file name
    const mockResponse = { original_filename: 'uploaded_file.txt' };
    uploadFile.mockResolvedValue(mockResponse);

    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />);

    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);

    // Wait for the upload to complete and check that the filename is displayed
    await waitFor(() => screen.getByText(/uploaded file: uploaded_file.txt/i));
  });
});
