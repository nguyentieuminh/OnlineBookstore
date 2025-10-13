import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch } from "../../api.js";
import "../css/AdminUserManagement.css";

export default function AdminUserManagement() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewUser, setViewUser] = useState(null);
    const [feedbackCounts, setFeedbackCounts] = useState({});

    useEffect(() => {
        const fetchFeedbackCounts = async () => {
            try {
                const data = await apiGet("admin/feedbacks");
                const counts = {};

                (data.data || []).forEach(f => {
                    const userId = f.user?.id || f.user?.UserID;
                    if (userId) counts[userId] = (counts[userId] || 0) + 1;
                });

                setFeedbackCounts(counts);
            } catch (err) {
                console.error("Failed to fetch feedback counts:", err);
            }
        };

        fetchFeedbackCounts();
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !user || user.Role !== "admin") {
            window.location.replace("/");
            return;
        }

        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiGet("admin/users");
            const list = (data.data || []).sort((a, b) =>
                a.Role === "admin" ? -1 : b.Role === "admin" ? 1 : 0
            );
            setUsers(list);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId) => {
        if (!window.confirm("Are you sure you want to toggle this user's status?")) return;
        try {
            await apiPatch(`admin/users/${userId}/toggle`);
            fetchUsers();
        } catch (err) {
            alert("Failed to update user status.");
        }
    };

    const handleMakeAdmin = async (userId) => {
        if (!window.confirm("Are you sure you want to promote this user to admin?")) return;
        try {
            await apiPatch(`admin/users/${userId}/make-admin`);
            fetchUsers();
        } catch (err) {
            alert("Failed to promote user.");
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchName = searchName
                ? (u.Name || "").toLowerCase().includes(searchName.toLowerCase())
                : true;
            const matchEmail = searchEmail
                ? (u.Email || "").toLowerCase().includes(searchEmail.toLowerCase())
                : true;
            return matchName && matchEmail;
        });
    }, [users, searchName, searchEmail]);

    if (loading)
        return (
            <div className="admin-message-container text-start mt-5">
                <p>⏳ Loading users...</p>
            </div>
        );

    if (error)
        return (
            <div className="admin-message-container text-start mt-5">
                <p className="text-danger">⚠ Error: {error}</p>
            </div>
        );

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            <h2 className="fw-bold mb-4">👥 User Management</h2>

            <div className="bg-light p-3 rounded-3 shadow-sm mb-4 row g-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control rounded-4"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control rounded-4"
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm p-3 table-responsive">
                {filteredUsers.length > 0 ? (
                    <table className="table align-middle table-hover">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id || index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>{user.Name || "Unknown"}</td>
                                    <td>{user.Email || "-"}</td>
                                    <td>{user.Role || "Customer"}</td>
                                    <td>
                                        <p
                                            className={`m-0 fw-semibold ${user.is_active
                                                ? "text-success"
                                                : "text-secondary"
                                                }`}
                                        >
                                            {user.is_active ? "Active" : "Inactive"}
                                        </p>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-4 admin-user-actions">
                                            {user.Role !== "admin" && (
                                                <>
                                                    <p
                                                        className={`m-0 fw-semibold action-text ${user.is_active
                                                            ? "text-danger"
                                                            : "text-success"
                                                            }`}
                                                        onClick={() =>
                                                            handleToggleActive(user.id)
                                                        }
                                                    >
                                                        {user.is_active
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </p>
                                                    <p
                                                        className="m-0 text-warning fw-semibold action-text"
                                                        onClick={() =>
                                                            handleMakeAdmin(user.id)
                                                        }
                                                    >
                                                        Make Admin
                                                    </p>
                                                </>
                                            )}
                                            <p
                                                className="m-0 text-primary fw-semibold action-text"
                                                onClick={() => setViewUser(user)}
                                            >
                                                View
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-muted my-4">📭 No users found.</p>
                )}
            </div>

            {viewUser && (
                <div
                    className="admin-user-popup position-fixed top-50 start-50 translate-middle bg-white p-4 rounded-4 shadow-lg"
                    style={{
                        zIndex: 3000,
                        width: "90%",
                        maxWidth: "600px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">User Details</h5>
                        <button
                            className="btn-close"
                            onClick={() => setViewUser(null)}
                        ></button>
                    </div>

                    <div>
                        <p><b>Name:</b> {viewUser.Name || "N/A"}</p>
                        <p><b>Email:</b> {viewUser.Email || "N/A"}</p>
                        <p><b>Role:</b> {viewUser.Role || "Customer"}</p>
                        <p><b>Status:</b> {viewUser.is_active ? "Active" : "Inactive"}</p>
                        <p><b>Created at:</b> {new Date(viewUser.created_at).toLocaleString()}</p>
                    </div>

                    <p>
                        <b>Total Feedbacks:</b>{" "}
                        {feedbackCounts[viewUser.id] || feedbackCounts[viewUser.UserID] || 0}{" "}
                        {(feedbackCounts[viewUser.id] || feedbackCounts[viewUser.UserID]) > 0 && (
                            <span
                                className="fw-semibold action-text ms-2"
                                style={{
                                    textDecoration: 'underline',
                                    color: '#6366F1',
                                    transition: 'color 0.3s ease-in-out',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#554f99ff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#6366F1'}
                                onClick={() => {
                                    localStorage.setItem("feedbackUserFilter", JSON.stringify({
                                        id: viewUser.id || viewUser.UserID,
                                        name: viewUser.Name,
                                        email: viewUser.Email
                                    }));
                                    navigate("/admin/feedback");
                                }}
                            >
                                Show
                            </span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
