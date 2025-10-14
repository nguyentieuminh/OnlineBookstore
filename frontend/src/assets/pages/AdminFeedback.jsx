import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api.js";
import "../css/AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchBook, setSearchBook] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await apiGet("admin/feedbacks");
        let all = data.data || [];

        const filter = localStorage.getItem("feedbackUserFilter");
        if (filter) {
          const userFilter = JSON.parse(filter);
          setSearchUser(userFilter.name || "");
          setSearchEmail(userFilter.email || "");
          localStorage.removeItem("feedbackUserFilter");
        }

        setFeedbacks(all);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      const matchBook = searchBook
        ? f.book?.BookTitle?.toLowerCase().includes(searchBook.toLowerCase())
        : true;

      const matchUser = searchUser
        ? f.user?.Name?.toLowerCase().includes(searchUser.toLowerCase())
        : true;

      const matchEmail = searchEmail
        ? f.user?.Email?.toLowerCase().includes(searchEmail.toLowerCase())
        : true;

      return matchBook && matchUser && matchEmail;
    });
  }, [feedbacks, searchBook, searchUser, searchEmail]);

  if (loading) return <div className="admin-message-container"><p>⏳ Loading data...</p></div>;
  if (error) return <div className="admin-message-container"><p className="error">⚠ Error: {error}</p></div>;

  return (
    <div className="admin-message-container">
      <h2 className="mb-4">📩 Customer Feedback</h2>

      <div
        className="d-flex align-items-center justify-content-between gap-3 mb-4"
        style={{ flexWrap: "nowrap" }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search by book title..."
          value={searchBook}
          onChange={(e) => setSearchBook(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Search by user name..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Search by user email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {filteredFeedbacks.length > 0 ? (
        <table className="message-table mb-5 mt-4">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Book</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map(f => (
              <tr key={f.id}>
                <td>{f.user ? f.user.Name : "Anonymous"}</td>
                <td>{f.user ? f.user.Email : "-"}</td>
                <td>{f.user ? f.user.PhoneNumber || "-" : "-"}</td>
                <td>{f.book ? f.book.BookTitle : "Unknown Book"}</td>
                <td>{f.rating} ⭐</td>
                <td>{f.comment || "-"}</td>
                <td>{new Date(f.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>📭 No feedback available.</p>
      )}
    </div>
  );
};

export default AdminFeedback;
