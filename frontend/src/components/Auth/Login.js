import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { loginUser } from '../../api';
import { setGlobalToken, getGlobalToken } from '../../store';
import './Login.css';

const Login = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Call the login API
    try {
      const response = await loginUser(username, password);
      const token = response.data.access_token;
      // Persist user data in the context and localStorage
      login({ token });
      setGlobalToken(username,token);
      console.log(typeof username,"login.js");
      navigate(`/user/${username}`);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Handle switch to registration page
  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleSwitchToRegister}>Switch to Register</button>
    </div>
  );
};

export default Login;
