import React from 'react';
import "../css/BookCard.css";

const colors = [
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#8B5CF6",
];

const BookCard = ({ title, author, price, description, image, category }) => {
    return (
        <div
            className="card border-0 shadow-sm text-decoration-none p-2 mb-4 book-card"
            style={{ borderRadius: "15px", backgroundColor: "#EEF2FF" }}
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

                {category && (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        {Array.isArray(category) ? (
                            category.map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="badge text-white px-2 py-1"
                                    style={{
                                        backgroundColor: colors[idx % colors.length],
                                        borderRadius: "8px",
                                        fontSize: "0.75rem"
                                    }}
                                >
                                    {cat}
                                </span>
                            ))
                        ) : (
                            <span
                                className="badge text-white px-2 py-1"
                                style={{ backgroundColor: colors[0], borderRadius: "8px", fontSize: "0.75rem" }}
                            >
                                {category}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-muted small mb-2">{description}</p>

                <h6 className="fw-bold fs-5 mb-3" style={{ color: "#6366F1" }}>
                    ${price}
                </h6>

                <button className="btn btn-dark w-100 mt-auto">
                    <i className="bi bi-cart3 me-2"></i> Add To Cart
                </button>
            </div>
        </div>
    );
};

export default BookCard;
