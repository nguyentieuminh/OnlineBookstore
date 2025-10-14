import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

export default function AdminAddNewBook() {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const categoryOptions = [
        "Cuisine", "Detective Fiction", "Thriller", "Literature", "History", "Design",
        "Technology", "Science", "Psychology", "Self-Help", "Astronomy", "Economics",
        "Business", "Children's Literature", "Physics", "Romance", "Historical Fiction",
        "Strategy", "Skill Development", "Fantasy", "Science Fiction", "Mystery",
        "Philosophy", "Current Events"
    ].map((c) => ({ value: c, label: c }));

    const tagOptions = [
        "Our Suggestion",
        "New Releases",
        "Best Seller",
        "Most Popular Books",
        "Top Rated Books"
    ].map((t) => ({ value: t, label: t }));

    const [book, setBook] = useState({
        BookTitle: "",
        Author: "",
        Publisher: "",
        YearOfPublication: "",
        Price: "",
        Quantity: "",
        Describe: "",
        image: "",
    });

    const [selectedCats, setSelectedCats] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            fetch(`http://localhost:8000/api/books/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.status) {
                        const b = data.data;
                        setBook({
                            BookTitle: b.BookTitle || "",
                            Author: b.Author || "",
                            Publisher: b.publisher?.PublisherName || "",
                            YearOfPublication: b.YearOfPublication || "",
                            Price: b.Price || "",
                            Quantity: b.Quantity || "",
                            Describe: b.Describe || "",
                            image: b.image || "",
                        });
                        setSelectedCats(
                            b.categories?.map((c) => ({ value: c.CategoryName, label: c.CategoryName })) || []
                        );
                        setSelectedTags(
                            b.tags?.map((t) => ({ value: t.TagName, label: t.TagName })) || []
                        );
                    }
                })
                .catch(console.error);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        const currentYear = new Date().getFullYear();

        if (!book.BookTitle.trim()) newErrors.BookTitle = "Title is required.";
        if (!book.Author.trim()) newErrors.Author = "Author is required.";
        if (!book.Publisher.trim()) newErrors.Publisher = "Publisher is required.";

        if (!book.YearOfPublication) newErrors.YearOfPublication = "Year is required.";
        else if (book.YearOfPublication < 0 || book.YearOfPublication > currentYear)
            newErrors.YearOfPublication = `Year must be between 0 and ${currentYear}.`;

        if (book.Price === "" || isNaN(book.Price) || book.Price < 0)
            newErrors.Price = "Price must be a positive number.";

        if (book.Quantity === "" || isNaN(book.Quantity) || book.Quantity < 0)
            newErrors.Quantity = "Quantity must be a positive number.";

        if (selectedCats.length === 0)
            newErrors.Categories = "Please select at least one category.";

        if (selectedTags.length === 0)
            newErrors.Tags = "Please select at least one tag.";

        if (!book.Describe.trim()) newErrors.Describe = "Description is required.";
        if (!book.image.trim()) newErrors.image = "Image URL is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must log in as admin!");
            return;
        }

        const payload = {
            ...book,
            Categories: selectedCats.map((c) => c.value),
            Tags: selectedTags.map((t) => t.value),
        };

        const url = isEditing
            ? `http://localhost:8000/api/admin/books/${id}`
            : "http://localhost:8000/api/admin/books";
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (res.ok && result.status) {
                alert(isEditing ? "Book updated successfully!" : "Book added successfully!");
                navigate("/admin/books", { state: { refresh: true } });
            } else {
                alert(result.message || "Failed to save book.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving book.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: 1000 }}>
            <h2 className="fw-bold mb-4">{isEditing ? "Edit Book" : "Add New Book"}</h2>

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-3 shadow-sm">
                <div className="row g-3">
                    {[
                        { label: "Title", name: "BookTitle" },
                        { label: "Author", name: "Author" },
                        { label: "Publisher", name: "Publisher" },
                    ].map(({ label, name }) => (
                        <div className="col-md-6" key={name}>
                            <label className="form-label fw-bold">{label}</label>
                            <input
                                type="text"
                                className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                                name={name}
                                value={book[name]}
                                onChange={handleChange}
                                style={{ width: '450px' }}
                            />
                            {errors[name] && (
                                <div className="invalid-feedback">{errors[name]}</div>
                            )}
                        </div>
                    ))}

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Year</label>
                        <input
                            type="number"
                            name="YearOfPublication"
                            className={`form-control no-spin ${errors.YearOfPublication ? "is-invalid" : ""}`}
                            value={book.YearOfPublication}
                            onChange={handleChange}
                            style={{ width: '450px' }}
                        />
                        {errors.YearOfPublication && (
                            <div className="invalid-feedback">{errors.YearOfPublication}</div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="Price"
                            className={`form-control no-spin ${errors.Price ? "is-invalid" : ""}`}
                            value={book.Price}
                            onChange={handleChange}
                            style={{ width: '450px' }}
                        />
                        {errors.Price && (
                            <div className="invalid-feedback">{errors.Price}</div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Stock Quantity</label>
                        <input
                            type="number"
                            name="Quantity"
                            className={`form-control no-spin ${errors.Quantity ? "is-invalid" : ""}`}
                            value={book.Quantity}
                            onChange={handleChange}
                            style={{ width: '450px' }}
                        />
                        {errors.Quantity && (
                            <div className="invalid-feedback">{errors.Quantity}</div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Categories</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            value={selectedCats}
                            onChange={setSelectedCats}
                            classNamePrefix="select"
                            placeholder="Select categories..."
                        />
                        {errors.Categories && (
                            <div className="text-danger small mt-1">{errors.Categories}</div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Tags</label>
                        <Select
                            isMulti
                            options={tagOptions}
                            value={selectedTags}
                            onChange={setSelectedTags}
                            style={{ width: '450px' }}
                            classNamePrefix="select"
                            placeholder="Select tags..."
                        />
                        {errors.Tags && (
                            <div className="text-danger small mt-1">{errors.Tags}</div>
                        )}
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Description</label>
                        <textarea
                            name="Describe"
                            className={`form-control ${errors.Describe ? "is-invalid" : ""}`}
                            rows="3"
                            value={book.Describe}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        ></textarea>
                        {errors.Describe && (
                            <div className="invalid-feedback">{errors.Describe}</div>
                        )}
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Image URL</label>
                        <input
                            type="text"
                            name="image"
                            className={`form-control ${errors.image ? "is-invalid" : ""}`}
                            value={book.image}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                        {errors.image && (
                            <div className="invalid-feedback">{errors.image}</div>
                        )}
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

            <style>{`
                input.no-spin::-webkit-inner-spin-button,
                input.no-spin::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input.no-spin {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
}
