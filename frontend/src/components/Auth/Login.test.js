import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';  // Adjust the path if necessary
import { loginUser } from '../../api';
import { setGlobalToken } from '../../store';
import { useNavigate } from 'react-router-dom';

// Mock the necessary modules
jest.mock('../../api', () => ({
  loginUser: jest.fn()
}));

jest.mock('../../store', () => ({
  setGlobalToken: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('Login Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);  // Mocking navigate function
  });

  it('should render login form correctly', () => {
    render(<Login onSwitch={jest.fn()} />);
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockResponse = { data: { access_token: 'fake-access-token' } };
    loginUser.mockResolvedValue(mockResponse);
    
    render(<Login onSwitch={jest.fn()} />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Login');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith('testuser', 'password123'));
    expect(setGlobalToken).toHaveBeenCalledWith('fake-access-token');
    expect(mockNavigate).toHaveBeenCalledWith('/user/testuser');
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Login failed. Please try again.';
    loginUser.mockRejectedValue(new Error(errorMessage));

    render(<Login onSwitch={jest.fn()} />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Login');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith('testuser', 'wrongpassword'));
    
    expect(screen.getByText('Login failed')).toBeInTheDocument();  // Assuming alert displays the error message
    expect(mockNavigate).not.toHaveBeenCalled();  // Ensure navigation did not happen
  });

  it('should switch to the register form when "Register" button is clicked', () => {
    const onSwitch = jest.fn();
    render(<Login onSwitch={onSwitch} />);
    
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);
    
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
