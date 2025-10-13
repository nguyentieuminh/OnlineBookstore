import React, { useEffect, useMemo, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../../api.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "../css/AdminOrders.css";

function normalizeOrders(data) {
    if (!Array.isArray(data)) return [];

    return data.map(order => ({
        id: order.id || order.OrderID || null,
        order_date: order.created_at || order.OrderDate || null,
        total: Number(order.total || 0),
        address: order.address || "",
        recipient_info: safeJson(order.recipient_info),
        status_ref: {
            label: order.status?.label || "Pending Confirmation",
            code: order.status?.code || "pending"
        },
        items: (order.items || []).map(it => ({
            name: it.book?.BookTitle || it.book?.title || it.book?.Title || "Unknown",
            image: it.book?.image || it.book?.Image || "",
            price: Number(it.price || it.book?.price || it.book?.Price || 0),
            quantity: it.quantity || 1,
        }))
    }));
}

function safeJson(value) {
    if (!value) return {};
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
        return {};
    }
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState(null);
    const [page, setPage] = useState(1);
    const [viewOrder, setViewOrder] = useState(null);

    const ORDERS_PER_PAGE = 10;
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAdminOrders();
                console.log("Fetched admin orders:", data);
                setOrders(normalizeOrders(data));
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }
        };

        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to update status");
            }

            const updatedOrder = await res.json();
            const normalized = normalizeOrders([updatedOrder])[0];
            setOrders(prev => prev.map(o => o.id === orderId ? normalized : o));

        } catch (err) {
            console.error("❌ Error updating order:", err);
            alert("Failed to update order status.");
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchStatus =
                filterStatus === "all" || order.status_ref?.label === filterStatus;
            const matchDate =
                !filterDate ||
                (order.order_date &&
                    format(new Date(order.order_date), "dd-MM-yyyy") ===
                    format(filterDate, "dd-MM-yyyy"));
            return matchStatus && matchDate;
        });
    }, [orders, filterStatus, filterDate]);

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const pagedOrders = filteredOrders
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
        .slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

    const statusOptions = [
        { value: "all", label: "All" },
        { value: "Pending Confirmation", label: "Pending Confirmation" },
        { value: "Processing", label: "Processing" },
        { value: "Out for Delivery", label: "Out for Delivery" },
        { value: "Delivered", label: "Delivered" },
        { value: "Cancelled", label: "Cancelled" }
    ];

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            <h2 className="fw-bold mb-4">Order Management</h2>

            <div className="p-3 mb-4 bg-light rounded shadow-sm">
                <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <p className="form-label">Order Date</p>
                        <DatePicker
                            className="form-control rounded-4"
                            selected={filterDate}
                            onChange={(date) => {
                                setFilterDate(date);
                                setPage(1);
                            }}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select a date"
                            isClearable
                        />
                    </div>
                    <div className="col-md-6">
                        <p className="form-label">Order Status</p>
                        <select
                            className="form-select rounded-4"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3 rounded-3 shadow-sm">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th className="text-center">Order ID</th>
                                <th className="text-center">Customer</th>
                                <th className="text-center">Order Date</th>
                                <th className="text-center">Books</th>
                                <th className="text-center">Total</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-4">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                            {pagedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="text-center">{String(order.id).slice(0, 8)}</td>
                                    <td className="text-center">
                                        {order.recipient_info?.name || "Anonymous"}
                                    </td>
                                    <td className="text-center">
                                        {order.order_date
                                            ? format(new Date(order.order_date), "dd-MM-yyyy HH:mm")
                                            : "N/A"}
                                    </td>
                                    <td className="text-center">
                                        {order.items?.[0]?.name || "Unknown"}{" "}
                                        {order.items?.length > 1 &&
                                            `(+${order.items.length - 1} more)`}
                                    </td>
                                    <td className="text-center text-danger fw-bold">
                                        ${order.total?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="text-center">
                                        <p
                                            className={`m-0 fw-semibold ${order.status_ref?.code === "pending"
                                                ? "text-secondary"
                                                : order.status_ref?.code === "processing"
                                                    ? "text-info"
                                                    : order.status_ref?.code === "delivering"
                                                        ? "text-warning"
                                                        : order.status_ref?.code === "delivered"
                                                            ? "text-success"
                                                            : order.status_ref?.code === "cancelled"
                                                                ? "text-danger"
                                                                : "text-muted"
                                                }`}
                                            style={{ fontSize: "15px" }}
                                        >
                                            {order.status_ref?.label || "Unknown"}
                                        </p>
                                    </td>

                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-4 admin-orders-actions">
                                            {order.status_ref?.label === "Pending Confirmation" && (
                                                <p
                                                    className="m-0 text-warning fw-semibold action-text"
                                                    onClick={() => handleUpdateStatus(order.id, "Processing")}
                                                >
                                                    Confirm
                                                </p>
                                            )}

                                            {order.status_ref?.label === "Processing" && (
                                                <p
                                                    className="m-0 text-info fw-semibold action-text"
                                                    onClick={() => handleUpdateStatus(order.id, "Out for Delivery")}
                                                >
                                                    Ship
                                                </p>
                                            )}

                                            {order.status_ref?.label === "Out for Delivery" && (
                                                <p
                                                    className="m-0 text-success fw-semibold action-text"
                                                    onClick={() => handleUpdateStatus(order.id, "Delivered")}
                                                >
                                                    Delivered
                                                </p>
                                            )}

                                            <p
                                                className="m-0 text-dark fw-semibold action-text"
                                                onClick={() => setViewOrder(order)}
                                            >
                                                View Details
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-end mt-3">
                        <nav>
                            <ul className="pagination mb-0">
                                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page - 1)}
                                    >
                                        &laquo;
                                    </button>
                                </li>
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <li
                                        key={idx}
                                        className={`page-item ${page === idx + 1 ? "active" : ""
                                            }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => setPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    </li>
                                ))}
                                <li
                                    className={`page-item ${page === totalPages ? "disabled" : ""
                                        }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page + 1)}
                                    >
                                        &raquo;
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {viewOrder && (
                <div
                    className="admin-order-popup"
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 3000,
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        padding: "30px",
                        width: "90%",
                        maxWidth: "800px",
                        maxHeight: "85vh",
                        overflowY: "auto",
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0">Order Details</h5>
                        <button
                            className="btn-close"
                            onClick={() => setViewOrder(null)}
                            style={{ filter: "invert(0.5)" }}
                        ></button>
                    </div>

                    <div className="mb-3">
                        <p><b>Customer:</b> {viewOrder.recipient_info?.name || "N/A"}</p>
                        <p><b>Email:</b> {viewOrder.recipient_info?.email || "N/A"}</p>
                        <p><b>Phone:</b> {viewOrder.recipient_info?.phone || "N/A"}</p>
                        <p><b>Address:</b> {viewOrder.address || "N/A"}</p>
                        <p><b>Order Date:</b> {new Date(viewOrder.order_date).toLocaleString()}</p>
                    </div>

                    <table className="table table-bordered align-middle mt-3">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Image</th>
                                <th className="text-start">Book Title</th>
                                <th className="text-center">Quantity</th>
                                <th className="text-center">Unit Price</th>
                                <th className="text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewOrder.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="text-center">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    width: 60,
                                                    height: 80,
                                                    objectFit: "cover",
                                                    borderRadius: 6,
                                                }}
                                            />
                                        ) : (
                                            <span className="text-muted">No image</span>
                                        )}
                                    </td>
                                    <td>{item.name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-center">${item.price?.toFixed(2)}</td>
                                    <td className="text-center">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-end mt-4 pt-3 border-top">
                        <div className="d-flex justify-content-end mb-1">
                            <span className="me-3 fw-medium text-secondary">Subtotal:</span>
                            <span className="fw-semibold">
                                ${viewOrder.items
                                    ?.reduce((sum, i) => sum + i.price * i.quantity, 0)
                                    .toFixed(2)}
                            </span>
                        </div>
                        <div className="d-flex justify-content-end mb-1">
                            <span className="me-3 fw-medium text-secondary">Shipping Fee:</span>
                            <span className="fw-semibold">
                                ${(viewOrder.shipping_fee ?? 5.0).toFixed(2)}
                            </span>
                        </div>
                        <div className="d-flex justify-content-end">
                            <span className="me-3 fw-bold fs-5 text-dark">Total:</span>
                            <span className="fw-bold fs-5 text-danger">
                                ${(viewOrder.total || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
