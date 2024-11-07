import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';  // Adjust the path if necessary
import { registerUser } from '../../api';
import { setGlobalToken } from '../../store';
import { useNavigate } from 'react-router-dom';

// Mock the necessary modules
jest.mock('../../api', () => ({
  registerUser: jest.fn(),
}));

jest.mock('../../store', () => ({
  setGlobalToken: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);  // Mocking navigate function
  });

  it('should render the registration form correctly', () => {
    render(<Register />);
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should handle successful registration', async () => {
    const mockResponse = { access_token: 'fake-access-token' };
    registerUser.mockResolvedValue(mockResponse);

    render(<Register />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Register');
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(registerUser).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    }));
    
    expect(setGlobalToken).toHaveBeenCalledWith('fake-access-token');
    expect(mockNavigate).toHaveBeenCalledWith('/user/newuser');
  });

  it('should handle registration failure', async () => {
    const errorMessage = 'Registration failed. Please try again.';
    registerUser.mockRejectedValue(new Error(errorMessage));

    render(<Register />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Register');
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(registerUser).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    }));

    // Ensure that the error message is displayed
    expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();  // Ensure navigation did not happen
  });

  it('should not submit the form with empty fields', () => {
    render(<Register />);

    const submitButton = screen.getByText('Register');
    fireEvent.click(submitButton);

    // Check if no API calls were made
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('should display error message when registration fails', async () => {
    const errorMessage = 'Registration failed. Please try again.';
    registerUser.mockRejectedValue(new Error(errorMessage));

    render(<Register />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existinguser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(registerUser).toHaveBeenCalledWith({
      username: 'existinguser',
      email: 'existinguser@example.com',
      password: 'password123'
    }));

    // Check that the error message is displayed
    expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
  });
});
