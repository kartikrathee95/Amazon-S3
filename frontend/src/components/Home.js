// src/components/Home.js
import React, { useState } from 'react';
import Login from './Auth/Login';
import Register from './Auth/Register';

const Home = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Register'}</h1>
            {isLogin ? <Login onSwitch={() => setIsLogin(false)} /> : <Register onSwitch={() => setIsLogin(true)} />}
        </div>
    );
};

export default Home;
