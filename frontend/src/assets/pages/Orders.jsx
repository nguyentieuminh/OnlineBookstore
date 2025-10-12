import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { getUserOrders, cancelOrder } from "../../api";
import "../css/Orders.css";

const STATUS_FALLBACK = {
    pending: { label: "Pending Confirmation", color: "#6c757d", icon: "hourglass-split", code: "pending" },
    processing: { label: "Processing", color: "#0d6efd", icon: "gear", code: "processing" },
    delivering: { label: "Out for Delivery", color: "#f59e0b", icon: "truck", code: "delivering" },
    delivered: { label: "Delivered", color: "#10b981", icon: "check-circle", code: "delivered" },
    cancelled: { label: "Cancelled", color: "#ef4444", icon: "x-circle", code: "cancelled" },
};

function normalizeCategories(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((c) => String(c).trim()).filter(Boolean);
    if (typeof raw === "string") {
        return raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [String(raw).trim()].filter(Boolean);
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("Pending Confirmation");
    const [viewOrder, setViewOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUserOrders();
            const data = Array.isArray(res) ? res : res.data || [];

            const normalized = data.map((order) => {
                const status = order.status || {};
                const status_ref = STATUS_FALLBACK[status.code] || {
                    label: status.label || "Pending Confirmation",
                    color: status.color || "#6c757d",
                    icon: status.icon || "hourglass-split",
                    code: status.code || "pending",
                };

                return {
                    id: order.id,
                    order_date: order.order_date || order.created_at,
                    total: Number(order.total || 0),
                    address: order.address,
                    status_ref,
                    items:
                        order.items?.map((item) => {
                            const bookRaw = item.book || {};

                            const publisher =
                                bookRaw.PublisherName ||
                                bookRaw.Publisher ||
                                bookRaw.publisher?.PublisherName ||
                                bookRaw.publisher?.name ||
                                "";

                            const categories = Array.isArray(bookRaw.categories)
                                ? bookRaw.categories.map((c) => c.CategoryName || c.name || c)
                                : normalizeCategories(bookRaw.category || bookRaw.Category);

                            const name = bookRaw.BookTitle || bookRaw.title || bookRaw.name || "(Unknown Title)";

                            const image = bookRaw.Image || bookRaw.image || "/default-book.jpg";

                            const author = bookRaw.Author || bookRaw.author || "";

                            return {
                                id: item.id,
                                quantity: item.quantity,
                                price: Number(item.price || item.Price || 0),
                                book: {
                                    id: bookRaw.BookID || bookRaw.id,
                                    name,
                                    image,
                                    author,
                                    publisher,
                                    categories,
                                },
                            };
                        }) || [],
                };
            });

            setOrders(normalized);
        } catch (err) {
            console.error("Failed to load orders:", err);
            toast.error("Failed to load orders. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((o) => o.status_ref?.label === activeTab);
    }, [orders, activeTab]);

    const handleReorder = (order) => {
        if (!order || !Array.isArray(order.items)) return;
        const reorderItems = order.items.map((item) => ({
            id: item.book?.id,
            BookID: item.book?.id,
            title: item.book?.name,
            image: item.book?.image,
            author: item.book?.author,
            publisher: item.book?.publisher,
            categories: item.book?.categories,
            price: item.price,
            quantity: item.quantity,
        }));

        localStorage.setItem("reorder_items", JSON.stringify(reorderItems));

        navigate("/orderform", { state: { items: reorderItems } });
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setIsCancelling(true);
        try {
            await cancelOrder(orderId);
            toast.success("Order cancelled successfully.");
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to cancel order.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading orders...</p>
            </div>
        );
    }

    const tabs = Object.values(STATUS_FALLBACK).map((s) => s.label);

    return (
        <div className="container py-4">
            <h1 className="fw-bold mb-4">My Orders</h1>

            <ul className="nav nav-tabs nav-fill custom-modern-tabs mb-4">
                {tabs.map((tab) => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`custom-tab-button-modern ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    </li>
                ))}
            </ul>

            {filteredOrders.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-box-seam display-6"></i>
                    <p className="mt-3 fs-5">No orders in this category.</p>
                </div>
            ) : (
                <div className="row g-5">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header d-flex justify-content-between align-items-center bg-light">
                                    <div>
                                        <strong>Order #{order.id}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {new Date(order.order_date).toLocaleString()}
                                        </small>
                                    </div>
                                    {order.status_ref && (
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: order.status_ref.color,
                                                color: "#fff",
                                            }}
                                        >
                                            <i className={`bi bi-${order.status_ref.icon} me-1`}></i>
                                            {order.status_ref.label}
                                        </span>
                                    )}
                                </div>

                                <div className="card-body">
                                    {order.items.map((item, idx) => (
                                        <div
                                            key={item.id || idx}
                                            className={`d-flex align-items-center gap-3 ${idx > 0 ? "mt-3 pt-3 border-top" : ""}`}
                                        >
                                            <img
                                                src={item.book?.image}
                                                alt={item.book?.name}
                                                style={{
                                                    width: 70,
                                                    height: 70,
                                                    borderRadius: 8,
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div className="flex-grow-1 text-start">
                                                <div className="fw-semibold mb-1" style={{ color: "#1E1B4B" }}>
                                                    {item.book?.name}
                                                </div>

                                                {(item.book?.author || item.book?.publisher) && (
                                                    <div className="text-muted small mb-1">
                                                        {item.book?.author && (
                                                            <span className="fw-semibold text-primary">{item.book.author}</span>
                                                        )}
                                                        {item.book?.author && item.book?.publisher && (
                                                            <span className="mx-1 text-muted">•</span>
                                                        )}
                                                        {item.book?.publisher && <span>{item.book.publisher}</span>}
                                                    </div>
                                                )}

                                                {Array.isArray(item.book?.categories) && item.book.categories.length > 0 && (
                                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                                        {item.book.categories.map((cat, i) => (
                                                            <span
                                                                key={i}
                                                                className="badge text-white px-2 py-1"
                                                                style={{
                                                                    backgroundColor: [
                                                                        "#6366F1",
                                                                        "#10B981",
                                                                        "#F59E0B",
                                                                        "#EF4444",
                                                                        "#3B82F6",
                                                                        "#8B5CF6",
                                                                    ][i % 6],
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
                                            <div className="text-end">
                                                <div className="small text-muted">Qty: {item.quantity}</div>
                                                <div className="small text-muted">Price: ${item.price.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                                    <div className="gap-5 d-flex justify-content-between align-items-center">
                                        {(() => {
                                            const subtotal = order.items.reduce(
                                                (sum, item) => sum + item.price * item.quantity,
                                                0
                                            );
                                            const shipping = Math.max(0, order.total - subtotal);
                                            return (
                                                <>
                                                    <div className="small text-muted">Subtotal: ${subtotal.toFixed(2)}</div>
                                                    <div className="small text-muted">Shipping: ${shipping.toFixed(2)}</div>
                                                </>
                                            );
                                        })()}
                                        <div className="fw-semibold me-2">Total: <span className="text-danger fw-bold">${order.total.toFixed(2)}</span></div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setViewOrder(order)}
                                        >
                                            View Details
                                        </button>

                                        {order.status_ref.code === "pending" && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={isCancelling}
                                            >
                                                {isCancelling ? "Cancelling..." : "Cancel"}
                                            </button>
                                        )}

                                        {order.status_ref.code === "cancelled" && (
                                            <button
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleReorder(order)}
                                            >
                                                Reorder
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewOrder && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order #{viewOrder.id}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setViewOrder(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <h6 className="fw-bold mb-3">Items</h6>
                                {viewOrder.items.map((item, i) => (
                                    <div
                                        key={item.id || i}
                                        className={`d-flex align-items-center justify-content-between py-3 ${i > 0 ? "border-top" : ""
                                            }`}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <img
                                                src={item.book?.image}
                                                alt={item.book?.name}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 8,
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div className="text-start">
                                                <div
                                                    className="fw-semibold mb-1"
                                                    style={{ color: "#1E1B4B" }}
                                                >
                                                    {item.book?.name}
                                                </div>

                                                {(item.book?.author || item.book?.publisher) && (
                                                    <div className="text-muted small mb-1">
                                                        {item.book?.author && (
                                                            <span className="fw-semibold text-primary">
                                                                {item.book.author}
                                                            </span>
                                                        )}
                                                        {item.book?.author && item.book?.publisher && (
                                                            <span className="mx-1 text-muted">•</span>
                                                        )}
                                                        {item.book?.publisher && (
                                                            <span>{item.book.publisher}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {Array.isArray(item.book?.categories) &&
                                                    item.book.categories.length > 0 && (
                                                        <div className="d-flex flex-wrap gap-2 mt-1">
                                                            {item.book.categories.map((cat, j) => (
                                                                <span
                                                                    key={j}
                                                                    className="badge text-white px-2 py-1"
                                                                    style={{
                                                                        backgroundColor: [
                                                                            "#6366F1",
                                                                            "#10B981",
                                                                            "#F59E0B",
                                                                            "#EF4444",
                                                                            "#3B82F6",
                                                                            "#8B5CF6",
                                                                        ][j % 6],
                                                                        borderRadius: "8px",
                                                                        fontSize: "0.7rem",
                                                                    }}
                                                                >
                                                                    {cat}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="text-end">
                                            <div className="small text-muted">Qty: {item.quantity}</div>
                                            <div className="small text-muted">
                                                Price: ${item.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <hr />
                                {(() => {
                                    const subtotal = viewOrder.items.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );
                                    const shipping = Math.max(0, viewOrder.total - subtotal);
                                    return (
                                        <div className="text-end">
                                            <div className="small text-muted">
                                                Subtotal: ${subtotal.toFixed(2)}
                                            </div>
                                            <div className="small text-muted">
                                                Shipping: ${shipping.toFixed(2)}
                                            </div>
                                            <div className="fw-bold">
                                                Total:{" "}
                                                <span className="text-danger">
                                                    ${viewOrder.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
