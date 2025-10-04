import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignUp.css';
import Books from "../images/Login-SignUp/Books.svg";

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailed, setShowFailed] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};

        if (!name.trim()) newErrors.name = "Full name is required.";
        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }
        if (!passwordConfirm) {
            newErrors.passwordConfirm = "Confirm password is required.";
        } else if (passwordConfirm !== password) {
            newErrors.passwordConfirm = "Passwords do not match.";
        }
        if (!dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) return;

        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirm,
                    dateOfBirth,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setShowSuccess(true);
            } else {
                setShowFailed(true);
            }
        } catch (error) {
            console.error(error);
            setServerError("Server connection error.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-form-section">
                <h1 className="signup-title">Create Account</h1>
                <p className="signup-subtext">Join us and explore the world of books!!!</p>

                <form className="signup-form" onSubmit={handleSignup} noValidate>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <p className="error-text">{errors.name}</p>}
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                        {errors.passwordConfirm && <p className="error-text">{errors.passwordConfirm}</p>}
                    </div>

                    <div className="input-group">
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                        {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}
                    </div>

                    {serverError && <p className="error-text">{serverError}</p>}

                    <button type="submit">Sign Up</button>
                </form>

                <p className="login-link">
                    Already have an account?{' '}
                    <span
                        className="signup-link"
                        onClick={() => navigate('/login')}
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: '#6366F1',
                            transition: 'color 0.3s ease-in-out',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}>
                        Login
                    </span>
                </p>
            </div>

            <div className="signup-image-section">
                <img src={Books} alt="Books" className="signup-image" />
            </div>

            {showSuccess && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>✅ Account created successfully!</h4>
                        <p>You can now login to continue</p>
                        <button onClick={() => navigate('/login')} className="popup-confirm">Go to Login</button>
                    </div>
                </div>
            )}

            {showFailed && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>❌ Account created Unsuccessfully!</h4>
                        <button onClick={() => setShowFailed(false)} className="popup-failed">Retry</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;
