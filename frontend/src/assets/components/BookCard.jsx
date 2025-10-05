import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/BookCard.css";

const BookCard = ({
    id,
    title,
    author,
    publisher,
    price,
    description,
    image,
    categories = [],
    tags = [],
    cartItems = [],
    addToCart,
    removeFromCart,
    favourites = [],
    addToFavourites,
    removeFromFavourites
}) => {
    const navigate = useNavigate();

    const isInCart =
        Array.isArray(cartItems) &&
        cartItems.some((item) => item.BookID === id || item.book?.BookID === id);
    const isFavourite =
        Array.isArray(favourites) && favourites.some((fav) => fav.id === id);

    const handleFavouriteClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentBook = {
            id,
            title,
            author,
            publisher,
            price,
            description,
            image,
            categories,
            tags,
        };
        if (isFavourite) removeFromFavourites(id);
        else addToFavourites(currentBook);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const currentBook = {
            id,
            title,
            author,
            publisher,
            price,
            description,
            image,
            categories,
            tags,
            quantity: 1,
        };

        if (isInCart) {
            const cartItem = cartItems.find(
                (item) => item.BookID === id || item.book?.BookID === id
            );

            if (cartItem && cartItem.CartID) {
                removeFromCart(cartItem.CartID);
            } else {
                console.error("Không tìm thấy CartItem để xoá! BookID:", id, cartItem);
            }
        } else {
            addToCart(currentBook);
        }
    };

    const bookImage = image && image.trim() !== "" ? image : "/images/default-book.jpg";

    const formatPrice = (price) => {
        if (typeof price !== "number") return price;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <Link
            to={`/book/${id}`}
            className="text-decoration-none text-black"
        >
            <div
                className="card border-0 shadow-sm p-2 mb-4 book-card"
                style={{
                    borderRadius: "15px",
                    backgroundColor: "#EEF2FF",
                    position: "relative",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease"
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
                    <button
                        className="btn btn-light rounded-circle position-absolute top-0 end-0 m-2"
                        onClick={handleFavouriteClick}
                    >
                        <i
                            className={`bi ${isFavourite ? "bi-heart-fill text-danger" : "bi-heart"}`}
                        ></i>
                    </button>
                </div>

                <div className="card-body d-flex flex-column text-start">
                    <h5 className="fw-semibold text-black mb-2" style={{ minHeight: "2.5rem" }}>
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
                                        backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"][idx % 6],
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
                        <p className="text-muted small mb-2" style={{
                            minHeight: "3rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {description.length > 90 ? `${description.slice(0, 90)}...` : description}
                        </p>
                    )}

                    <h6 className="fw-bold fs-5 mb-3" style={{ color: "#6366F1" }}>
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
                                (e.currentTarget.style.backgroundColor = "#333333")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = "#000")
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            Buy Now
                        </button>

                        <button
                            className="btn rounded-circle border"
                            onClick={handleAddToCartClick}
                            style={{
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isInCart ? "#6366F1" : "#fff",
                                borderColor: isInCart ? "#6366F1" : "#ccc",
                            }}
                            onMouseOver={(e) => {
                                if (!isInCart) e.currentTarget.style.backgroundColor = "#f1f1f1";
                            }}
                            onMouseOut={(e) => {
                                if (!isInCart) e.currentTarget.style.backgroundColor = "#fff";
                            }}
                        >
                            <i
                                className={`bi bi-cart3 ${isInCart ? "text-white" : "text-dark"}`}
                            ></i>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
