import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Cart.css";
import { clearCart } from "../../api.js";

const Cart = ({ items = [], setItems, removeFromCart, updateQuantity }) => {

    const navigate = useNavigate();

    const subtotal = items.reduce(
        (sum, item) => sum + (item.book?.Price || 0) * (item.Quantity || 1),
        0
    );
    const shipping = items.length > 0 ? 5 : 0;
    const total = subtotal + shipping;

    const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

    if (items.length === 0) {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ height: "70vh" }}
            >
                <i className="bi bi-cart fs-1 text-secondary mb-3"></i>
                <h4>Your cart is empty</h4>
                <p className="text-muted">
                    Looks like you haven't added anything yet.{" "}
                    <Link
                        to="/shop"
                        style={{
                            textDecoration: "underline",
                            color: "#6366F1",
                            transition: "color 0.3s ease-in-out",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#554f99ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6366F1")}
                    >
                        Go to Shop
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <h2 className="fw-semibold mb-4">Your Cart</h2>
            <div className="row">
                <div className="col-md-8">
                    {items.map((item) => {
                        const book = item.book || {};
                        const categories = book.categories?.map((c) => c.CategoryName) || [];
                        const publisher = book.publisher?.PublisherName || "";

                        return (
                            <div key={item.id || item.CartID} className="card mb-3 p-3 shadow-sm">
                                <div className="row g-3 align-items-center">
                                    <div className="col-3 col-md-2">
                                        <img
                                            src={book.image || "/default-book.jpg"}
                                            alt={book.BookTitle}
                                            className="img-fluid rounded"
                                        />
                                    </div>

                                    <div className="col-6 col-md-7">
                                        <h6 className="mb-1">{book.BookTitle}</h6>
                                        <span className="fw-semibold text-primary">{book.Author}</span>
                                        {publisher && (
                                            <>
                                                <span className="mx-1 text-muted">•</span>
                                                <span className="text-muted">{publisher}</span>
                                            </>
                                        )}

                                        {categories.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {categories.map((cat, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="badge text-white px-2 py-1"
                                                        style={{
                                                            backgroundColor: colors[idx % colors.length],
                                                            borderRadius: "8px",
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-3 col-md-3 text-end">
                                        <p className="mb-2 fs-6 fw-semibold text-danger">
                                            ${(book.Price * (item.Quantity || 1)).toFixed(2)}
                                        </p>

                                        <div className="d-flex justify-content-end align-items-center gap-2">
                                            <div
                                                className="d-flex align-items-center rounded overflow-hidden quantity-control"
                                                style={{
                                                    border: "1px solid #000",
                                                    width: "120px",
                                                    height: "31px",
                                                }}
                                            >
                                                <button
                                                    className="btn btn-sm bg-light flex-fill"
                                                    style={{
                                                        borderRight: "1px solid #000",
                                                        borderRadius: 0,
                                                    }}
                                                    onClick={() =>
                                                        updateQuantity(item.id || item.CartID, Math.max(1, (item.Quantity || 1) - 1))
                                                    }
                                                >
                                                    –
                                                </button>

                                                <input
                                                    type="text"
                                                    value={item.Quantity || 1}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateQuantity(item.id || item.CartID, isNaN(val) ? 1 : Math.max(1, val));
                                                    }}
                                                    className="form-control form-control-sm text-center flex-fill"
                                                    style={{
                                                        border: "none",
                                                        borderRadius: 0,
                                                        boxShadow: "none",
                                                        width: "40px",
                                                    }}
                                                />

                                                <button
                                                    className="btn btn-sm bg-light flex-fill"
                                                    style={{
                                                        borderLeft: "1px solid #000",
                                                        borderRadius: 0,
                                                    }}
                                                    onClick={() =>
                                                        updateQuantity(item.id || item.CartID, (item.Quantity || 1) + 1)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                className="btn btn-sm btn-outline-danger ms-1"
                                                onClick={() => removeFromCart(item.id || item.CartID)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="col-md-4">
                    <div className="card p-3 shadow-sm">
                        <h6 className="mb-3">Order Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>

                        <hr />
                        <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                            <span>Total</span>
                            <span className="text-danger">${total.toFixed(2)}</span>
                        </div>

                        <button
                            className="btn btn-dark w-100"
                            onClick={async () => {
                                if (items.length === 0) return;

                                try {

                                    const formattedItems = items.map((item) => {
                                        const book = item.book || {};
                                        return {
                                            id: book.BookID,
                                            title: book.BookTitle,
                                            author: book.Author,
                                            publisher: book.publisher?.PublisherName || "",
                                            categories: book.categories?.map((c) => c.CategoryName) || [],
                                            image: book.image || "/default-book.jpg",
                                            price: book.Price || 0,
                                            quantity: item.Quantity || 1,
                                        };
                                    });

                                    navigate("/orderform", { state: { items: formattedItems } });

                                } catch (err) {
                                    console.error("Failed to clear cart:", err);
                                }
                            }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
