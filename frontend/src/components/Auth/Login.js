// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { setGlobalToken } from '../../store';
import './Login.css';

const Login = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await loginUser(username, password);  // Call login API
          setGlobalToken(response.data.access_token);  // Store the access token
          navigate(`/user/${username}`);  // Redirect to user-specific page
      } catch (error) {
          alert("Login failed", error);
          console.error("Login failed:", error);
      }
  };

  return (
      <div className="container">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
              />
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
              />
              <button type="submit">Login</button>
              <p>
                  Don't have an account? <button type="button" onClick={onSwitch}>Register</button>
              </p>
          </form>
      </div>
  );
};

export default Login;
