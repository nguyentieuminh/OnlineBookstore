import React from 'react';
import { Link } from 'react-router-dom';

import UserAva from '../images/Header/UserAvatar.png';

export default function Header() {
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

                <div className="d-flex gap-3 align-items-center">
                    <img
                        className=''
                        src={UserAva}
                        alt="User Avatar"
                        style={{
                            width: '30px',
                            height: '30px',
                            objectFit: 'cover',
                            border: 'none'
                        }}
                    />
                    <span className="" style={{ color: '#1E1B4B', fontWeight: '500' }}>Guest</span>
                </div>
            </div>
        </header>
    );
}
