import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Reusing login styles for consistency

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
            await axios.post(`${API_BASE}/auth/register`, { name, email, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Registration failed. Email might already be in use.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <span className="logo-icon">📝</span>
                    <h1>Citizen <span className="highlight">Registration</span></h1>
                    <p>Join the infrastructure monitoring network</p>
                </div>
                
                {success ? (
                    <div className="status-msg success">
                        Registration successful! Redirecting to login...
                    </div>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="John Doe"
                                required 
                            />
                        </div>
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
                                placeholder="Min 8 characters"
                                required 
                            />
                        </div>
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="login-btn">Create Account</button>
                        
                        <div className="login-footer">
                            <p>Already have an account? <Link to="/login" style={{color: '#4fd1c5', textDecoration: 'none'}}>Login here</Link></p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
