import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserAva from '../images/Header/UserAvatar.png';

export default function Header({ cartItems = [] }) {
    const totalItems = cartItems.length;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header
            className="bg-white shadow-sm"
            style={{
                borderBottom: '1px solid #e0e0e0',
                height: '80px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
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
                        letterSpacing: '1px'
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
                        { to: '/about', label: 'About us' }
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.to}
                            className="nav-link"
                            style={{
                                color: '#1E1B4B',
                                textDecoration: 'none',
                                fontWeight: '500',
                                position: 'relative',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#6366F1'}
                            onMouseLeave={(e) => e.target.style.color = '#1E1B4B'}
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
                                    fontWeight: 'bold'
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
                                borderRadius: '50%'
                            }}
                        />
                        <span style={{ color: '#1E1B4B', fontWeight: '500' }}>Guest</span>

                        <div
                            style={{
                                position: 'absolute',
                                top: '50px',
                                right: 0,
                                backgroundColor: '#fff',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                minWidth: '160px',
                                opacity: dropdownOpen ? 1 : 0,
                                transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
                                pointerEvents: dropdownOpen ? 'auto' : 'none',
                                transition: 'all 0.25s ease',
                                zIndex: 2000
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '12px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#fff',
                                    transform: 'rotate(45deg)',
                                    boxShadow: '-2px -2px 5px rgba(0,0,0,0.05)'
                                }}
                            ></div>

                            <Link
                                to="/orders"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    textDecoration: 'none',
                                    color: '#1E1B4B',
                                    fontWeight: '500',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                onClick={() => setDropdownOpen(false)}
                            >
                                <i className="bi bi-bag"></i> Orders
                            </Link>

                            <Link
                                to="/login"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    textDecoration: 'none',
                                    color: '#1E1B4B',
                                    fontWeight: '500',
                                    transition: 'background 0.2s',
                                    borderTop: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                onClick={() => setDropdownOpen(false)}
                            >
                                <i className="bi bi-box-arrow-in-right"></i> Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
