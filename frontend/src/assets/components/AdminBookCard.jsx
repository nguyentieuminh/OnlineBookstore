import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/BookCard.css";

const AdminBookCard = ({
    id,
    title,
    author,
    publisher,
    price,
    description,
    image,
    categories = [],
    tags = [],
    onEdit,
    onDeleteRequest,
}) => {

    const [showRemove, setShowRemove] = useState(false);

    const bookImage = image && image.trim() !== "" ? image : "/images/default-book.jpg";

    const formatPrice = (price) => {
        if (typeof price !== "number") return price;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <div
                className="card border-0 shadow-sm p-2 mb-4 book-card text-decoration-none text-black"
                style={{
                    borderRadius: "15px",
                    backgroundColor: "#EEF2FF",
                    position: "relative",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
            >
                <div className="position-relative d-flex justify-content-center pt-2">
                    <img
                        src={bookImage}
                        className="card-img-top"
                        alt={title}
                        style={{
                            height: "250px",
                            width: "250px",
                            objectFit: "cover",
                            borderRadius: "10px",
                        }}
                    />
                </div>

                <div className="card-body d-flex flex-column text-start">
                    <h5
                        className="fw-semibold text-black mb-2"
                        style={{ minHeight: "2.5rem" }}
                    >
                        {title}
                    </h5>

                    <p className="small mb-2">
                        {author && <span className="fw-semibold text-primary">{author}</span>}
                        {publisher && (
                            <>
                                <span className="mx-1 text-muted">•</span>
                                <span className="text-muted">{publisher}</span>
                            </>
                        )}
                    </p>

                    {Array.isArray(categories) && categories.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {categories.map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="badge text-white px-2 py-1"
                                    style={{
                                        backgroundColor: [
                                            "#6366F1",
                                            "#10B981",
                                            "#F59E0B",
                                            "#EF4444",
                                            "#3B82F6",
                                            "#8B5CF6",
                                        ][idx % 6],
                                        borderRadius: "8px",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {description && (
                        <p
                            className="text-muted small mb-2"
                            style={{
                                minHeight: "3rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {description.length > 90
                                ? `${description.slice(0, 90)}...`
                                : description}
                        </p>
                    )}

                    <h6
                        className="fw-bold fs-5 mb-3"
                        style={{ color: "#6366F1" }}
                    >
                        {formatPrice(price)}
                    </h6>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                        <button
                            className="btn rounded-pill px-3 py-2 flex-grow-1 me-2"
                            style={{
                                backgroundColor: "#000",
                                color: "#fff",
                                border: "none",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = "#333")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = "#000")
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(id);
                            }}
                        >
                            <i className="bi bi-pencil me-2"></i>Edit
                        </button>

                        <button
                            className="btn rounded-circle border"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDeleteRequest(id, title);
                            }}
                            style={{
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#fff",
                                borderColor: "#dc3545",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8d7da")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fff")
                            }
                        >
                            <i className="bi bi-trash text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminBookCard;
