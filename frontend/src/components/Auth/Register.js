import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api';
import { setGlobalToken } from '../../store';
import './Register.css'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser({ username, email, password });
      if (response) {
        setGlobalToken(username, response.access_token);
        navigate(`/user/${username}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  // navigate back to login page
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          className="input-box"
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          className="input-box"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="input-box"
        />
        <button type="submit" className="submit-button">Register</button>
      </form>
      
      <button onClick={handleBackToLogin} className="back-to-login-button">Back to Login</button>
    </div>
  );
};

export default Register;
