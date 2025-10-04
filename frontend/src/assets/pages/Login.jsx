import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../css/Login.css';
import Books from "../images/Login-SignUp/Books.svg";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailed, setShowFailed] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');
        setError('');

        let hasError = false;
        if (!email.trim()) {
            setEmailError('Please enter your email');
            hasError = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError('Please enter a valid email address');
                hasError = true;
            }
        }

        if (!password.trim()) {
            setPasswordError('Please enter your password');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            hasError = true;
        }

        if (hasError) return;

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.Role);
                localStorage.setItem('userName', data.user.Name);

                if (data.user.Role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }

                setShowSuccess(true);
            } else {
                setShowFailed(true);
            }
        } catch (error) {
            setError('Connection error to server.');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container container">
            <div className="login-form-section me-4">
                <h1 className="login-title">Holla,<br />Welcome to OnlineBookstore</h1>
                <p className="login-subtext">Hey, welcome back to your special place</p>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {emailError && (
                            <p className="error-text">{emailError}</p>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {passwordError && (
                            <p className="error-text">{passwordError}</p>
                        )}
                    </div>

                    {error && (
                        <p className="error-text">{error}</p>
                    )}

                    <div className="form-remember">
                        <label className="checkbox-remember">
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" className="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit">Sign In</button>
                </form>

                <p className="signup-link">
                    Don't have an account? <Link
                        to="/signup"
                        style={{
                            textDecoration: 'underline',
                            color: '#6366F1',
                            transition: 'color 0.3s ease-in-out',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}
                    >Sign Up</Link>
                </p>
            </div>

            <div className="login-image-section">
                <img src={Books} alt="Books" className="login-image" />
            </div>

            {showSuccess && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>✅ Login successfully!</h4>
                        <p>You can now login to continue</p>
                        <button onClick={() => navigate('/')} className="popup-confirm">Back to Home</button>
                    </div>
                </div>
            )}

            {showFailed && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>❌ Login Unsuccessfully!</h4>
                        <p>Maybe you forgot the email or the password. Please try agian!</p>
                        <button onClick={() => setShowFailed(false)} className="popup-confirm">Retry</button>
                    </div>
                </div>
            )}
        </div >
    );
}

export default Login;
