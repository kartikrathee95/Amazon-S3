import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import './Login.css';

const Login = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { username }; 
    login(userData); 

    navigate(`/user/${username}`);
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
