import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminAddNewBook() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [book, setBook] = useState({
        BookTitle: "",
        Author: "",
        PublisherID: "",
        YearOfPublication: "",
        Price: "",
        Quantity: "",
        Describe: "",
        image: "",
    });

    const [publishers, setPublishers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCats, setSelectedCats] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/publishers")
            .then(res => res.json())
            .then(data => setPublishers(data.data || []))
            .catch(console.error);

        fetch("http://localhost:8000/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data.data || []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (isEditing) {
            fetch(`http://localhost:8000/api/books/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status) {
                        const b = data.data;
                        setBook({
                            BookTitle: b.BookTitle,
                            Author: b.Author,
                            PublisherID: b.publisher?.PublisherID || "",
                            YearOfPublication: b.YearOfPublication || "",
                            Price: b.Price || "",
                            Quantity: b.Quantity || "",
                            Describe: b.Describe || "",
                            image: b.image || "",
                        });
                        setSelectedCats(b.categories?.map(c => c.CategoryID) || []);
                    }
                })
                .catch(console.error);
        }
    }, [id]);

    const handleChange = e => {
        const { name, value } = e.target;
        setBook(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = id => {
        setSelectedCats(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const url = isEditing
            ? `http://localhost:8000/api/admin/books/${id}`
            : "http://localhost:8000/api/admin/books";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...book, categories: selectedCats }),
        });

        if (res.ok) {
            navigate("/admin/books", { state: { refresh: true } });
        } else {
            alert("Failed to save book.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: 1000 }}>
            <h2 className="fw-bold mb-4">{isEditing ? "Edit Book" : "Add New Book"}</h2>

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-3 shadow-sm">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            name="BookTitle"
                            value={book.BookTitle}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Author</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Author"
                            value={book.Author}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Publisher</label>
                        <select
                            name="PublisherID"
                            className="form-select"
                            value={book.PublisherID}
                            onChange={handleChange}
                        >
                            <option value="">Select Publisher</option>
                            {publishers.map(p => (
                                <option key={p.PublisherID} value={p.PublisherID}>
                                    {p.PublisherName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Year</label>
                        <input
                            type="number"
                            name="YearOfPublication"
                            className="form-control"
                            value={book.YearOfPublication}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="Price"
                            className="form-control"
                            value={book.Price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Stock Quantity</label>
                        <input
                            type="number"
                            name="Quantity"
                            className="form-control"
                            value={book.Quantity}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Categories</label>
                        <div className="d-flex flex-wrap gap-3">
                            {categories.map(c => (
                                <div key={c.CategoryID} className="form-check">
                                    <input
                                        type="checkbox"
                                        id={`cat-${c.CategoryID}`}
                                        className="form-check-input"
                                        checked={selectedCats.includes(c.CategoryID)}
                                        onChange={() => handleCategoryToggle(c.CategoryID)}
                                    />
                                    <label className="form-check-label" htmlFor={`cat-${c.CategoryID}`}>
                                        {c.CategoryName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Description</label>
                        <textarea
                            name="Describe"
                            className="form-control"
                            rows="3"
                            value={book.Describe}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Image URL</label>
                        <input
                            type="text"
                            name="image"
                            className="form-control"
                            value={book.image}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4 gap-2">
                    <button type="submit" className="btn btn-primary rounded-pill px-4">
                        {isEditing ? "Update Book" : "Add Book"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => navigate("/admin/books")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
