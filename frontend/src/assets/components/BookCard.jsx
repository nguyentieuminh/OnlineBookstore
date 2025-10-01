import React from 'react';
import "../css/BookCard.css";

const BookCard = ({ title, author, price, description, image }) => {
    return (
        <div 
            className="card border-0 shadow-sm text-decoration-none p-2 mb-4 book-card"
            style={{ borderRadius: "15px", backgroundColor: "#EEF2FF", height: "510px" }}
        >
            <div className="position-relative d-flex justify-content-center pt-2">
                <img 
                    src={image} 
                    className="card-img-top" 
                    alt={title} 
                    style={{ height: "250px", width: "250px", objectFit: "cover", borderRadius: "10px" }} 
                />
            </div>

            <div className="card-body d-flex flex-column text-start">
                <h5 className="fw-semibold text-black mb-2">{title}</h5>
                <p className="text-primary small mb-2">{author}</p>
                <p className="text-muted small">{description}</p>

                <h6 className="fw-bold fs-5 mb-3" style={{ color: "#6366F1" }}>
                    ${price}
                </h6>

                <button className="btn btn-dark w-100">
                    <i className="bi bi-cart3 me-2"></i> Add To Cart
                </button>
            </div>
        </div>
    );
};

export default BookCard;
