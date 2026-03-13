import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
            const { user, token } = res.data;
            login(user, token);
            navigate('/');
        } catch (err) {
            setError('Login failed. Backend might be down or invalid credentials.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <span className="logo-icon">🛣️</span>
                    <h1>GeoRoad <span className="highlight">Monitor</span></h1>
                    <p>Infrastructure Intelligent Dashboard</p>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="your@email.com"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    {error && <div className="login-error">{error}</div>}
                    <button type="submit" className="login-btn">Secure Login</button>
                    
                    <div className="login-footer">
                        <p>Don't have an account? <Link to="/register" style={{color: '#4fd1c5', textDecoration: 'none'}}>Register here</Link></p>
                        <p style={{marginTop: '1rem'}}>Demo Credentials:</p>
                        <code>admin@georoad.com / admin</code><br/>
                        <code>user@georoad.com / user</code>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
