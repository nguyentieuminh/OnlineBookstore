import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAva from '../images/Header/UserAvatar.png';

export default function Header({ cartItems = [] }) {
    const totalItems = cartItems.length;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role');
    const isLoggedIn = !!userName;
    const isAdmin = isLoggedIn && userRole === 'admin';

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        setDropdownOpen(false);
        navigate('/login');
    };

    return (
        <header
            className="bg-white shadow-sm"
            style={{
                borderBottom: '1px solid #e0e0e0',
                height: '80px',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}
        >
            <div
                className="d-flex align-items-center justify-content-between container"
                style={{ height: '100%' }}
            >
                <Link
                    to="/"
                    className="fw-bold"
                    style={{
                        fontSize: '24px',
                        color: '#2c3e50',
                        textDecoration: 'none',
                        fontFamily: 'Georgia, serif',
                        letterSpacing: '1px',
                    }}
                >
                    <span style={{ color: '#6366F1' }}>Online</span>
                    <span style={{ color: '#1E1B4B' }}>Bookstore</span>
                </Link>

                <nav className="d-flex gap-4">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/shop', label: 'Shop' },
                        { to: '/favourite', label: 'Favourite' },
                        { to: '/contact', label: 'Contact' },
                        { to: '/about', label: 'About us' },
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.to}
                            className="nav-link"
                            style={{
                                color: '#1E1B4B',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'color 0.3s',
                            }}
                            onMouseEnter={(e) => (e.target.style.color = '#6366F1')}
                            onMouseLeave={(e) => (e.target.style.color = '#1E1B4B')}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="d-flex gap-4 align-items-center position-relative" ref={dropdownRef}>
                    <Link to="/cart" style={{ color: '#1E1B4B', fontSize: '20px', position: 'relative' }}>
                        <i className="bi bi-cart"></i>
                        {totalItems > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-10px',
                                    backgroundColor: 'red',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '8px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    <div
                        className="d-flex gap-2 align-items-center"
                        style={{ cursor: 'pointer', position: 'relative' }}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                        <img
                            src={UserAva}
                            alt="User Avatar"
                            style={{
                                width: '34px',
                                height: '34px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                            }}
                        />
                        <span style={{ color: '#1E1B4B', fontWeight: '500' }}>
                            {isLoggedIn ? userName : 'Guest'}
                        </span>

                        {dropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    backgroundColor: '#fff',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                    borderRadius: '8px',
                                    minWidth: '160px',
                                    zIndex: 2000,
                                }}
                            >
                                {isLoggedIn && (
                                    <Link
                                        to="/orders"
                                        style={{
                                            display: 'block',
                                            padding: '10px 16px',
                                            color: '#1E1B4B',
                                            textDecoration: 'none',
                                        }}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <i className="bi bi-bag"></i> Orders
                                    </Link>
                                )}

                                {isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        style={{
                                            display: 'block',
                                            padding: '10px 16px',
                                            color: '#1E1B4B',
                                            textDecoration: 'none',
                                        }}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <i className="bi bi-speedometer2"></i> Dashboard
                                    </Link>
                                )}

                                {!isLoggedIn ? (
                                    <Link
                                        to="/login"
                                        style={{
                                            display: 'block',
                                            padding: '10px 16px',
                                            borderTop: '1px solid #eee',
                                            color: '#1E1B4B',
                                            textDecoration: 'none',
                                        }}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <i className="bi bi-box-arrow-in-right"></i> Login
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            padding: '10px 16px',
                                            borderTop: '1px solid #eee',
                                            color: 'red',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
