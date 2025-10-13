import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api.js";
import "../css/AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchBook, setSearchBook] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await apiGet("admin/feedbacks");
        setFeedbacks(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    if (!searchBook) return feedbacks;

    const words = searchBook
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => new RegExp(word, "i"));

    return feedbacks.filter(f => {
      if (!f.book?.BookTitle) return false;

      return words.every(regex => regex.test(f.book.BookTitle));
    });
  }, [feedbacks, searchBook]);

  if (loading) return <div className="admin-message-container"><p>⏳ Loading data...</p></div>;
  if (error) return <div className="admin-message-container"><p className="error">⚠ Error: {error}</p></div>;

  return (
    <div className="admin-message-container">
      <h2 className="mb-4">📩 Customer Feedback</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by book title..."
          value={searchBook}
          onChange={(e) => setSearchBook(e.target.value)}
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
