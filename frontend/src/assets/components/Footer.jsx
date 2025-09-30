import React from 'react';
import { Link } from 'react-router-dom';
import Mastercard from '../images/Footer/Mastercard.svg';
import Visa from '../images/Footer/Visa.svg';
import Vietinbank from '../images/Footer/Vietinbank.png';

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-5">
            <div
                className="container"
                style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
                <div className="row text-start">
                    <div className="col-12 col-md-3">
                        <h5 className="fw-bold mb-3">Books</h5>
                        <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            Books Delivered. Imagination Unlimited.
                        </p>
                    </div>

                    <div className="col-12 col-md-3">
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className="list-unstyled" style={{ lineHeight: '2' }}>
                            <li>
                                <Link to="/" className="text-decoration-none text-white-50">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-decoration-none text-white-50">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-decoration-none text-white-50">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-12 col-md-3">
                        <h5 className="fw-bold mb-3">Contact</h5>
                        <p className="mb-1" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            Email: tiu@gmail.com
                        </p>
                        <p className="mb-1" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            Phone: 0123456789
                        </p>
                        <p className="mb-0" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            175 Tay Son, Kim Lien, Hanoi
                        </p>
                    </div>

                    <div className="col-12 col-md-3">
                        <h5 className="fw-bold mb-3">We Accept</h5>
                        <div className="d-flex gap-3">
                            <img src={Visa} alt="Visa" style={{ height: '35px' }} />
                            <img src={Mastercard} alt="Mastercard" style={{ height: '35px' }} />
                            <img src={Vietinbank} alt="Vietinbank" style={{ height: '35px' }} />
                        </div>
                    </div>
                </div>

                <hr style={{ borderColor: '#fff' }} />

                <div className="text-center pb-3" style={{ fontSize: '0.85rem', color: '#aaa' }}>
                    © 2025 Books. All rights reserved. | Made By Tiu ❤️
                </div>
            </div>
        </footer>
    );
}
