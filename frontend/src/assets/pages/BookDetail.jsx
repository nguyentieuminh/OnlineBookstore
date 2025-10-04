import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BookCard from "../components/BookCard.jsx";
import "../css/BookDetail.css";

export default function BookDetail({
    favourites,
    addToFavourites,
    removeFromFavourites,
    addToCart,
    removeFromCart,
    cartItems,
}) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showRemovePopup, setShowRemovePopup] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailSuccess, setEmailSuccess] = useState('');

    const isBookInCart = useMemo(() => {
        return cartItems.some((item) => item.id === book?.id);
    }, [cartItems, book]);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/books/${id}`);
                if (!res.ok) throw new Error("Failed to fetch book");
                const result = await res.json();

                if (result.status && result.data) {
                    const b = result.data;
                    const formattedBook = {
                        id: b.BookID,
                        title: b.BookTitle,
                        author: b.Author,
                        publisher: b.publisher?.PublisherName || "Unknown Publisher",
                        description: b.Describe || "No description available.",
                        year: b.YearOfPublication,
                        price: Number(b.Price) || 0,
                        stock: Number(b.Quantity) || 0,
                        tags: b.tags?.map((t) => t.TagName) || [],
                        categories: b.categories?.map((c) => c.CategoryName) || [],
                        image: b.image
                            ? b.image.startsWith("http://localhost:8000/")
                                ? b.image.replace("http://localhost:8000", "")
                                : b.image
                            : "/default-book.jpg",
                    };
                    setBook(formattedBook);

                    const allRes = await fetch(`http://localhost:8000/api/books`);
                    const allData = await allRes.json();

                    if (allData.status && Array.isArray(allData.data)) {
                        const formattedAll = allData.data.map((bk) => ({
                            id: bk.BookID,
                            title: bk.BookTitle,
                            author: bk.Author,
                            price: Number(bk.Price) || 0,
                            stock: Number(bk.Quantity) || 0,
                            publisher: bk.publisher?.PublisherName || "Unknown",
                            tags: bk.tags?.map((t) => t.TagName) || [],
                            categories: bk.categories?.map((c) => c.CategoryName) || [],
                            image: bk.image
                                ? bk.image.startsWith("http://localhost:8000/")
                                    ? bk.image.replace("http://localhost:8000", "")
                                    : bk.image
                                : "/default-book.jpg",
                        }));

                        let similar = formattedAll.filter(
                            (bk) =>
                                bk.id !== formattedBook.id &&
                                bk.categories.some((c) =>
                                    formattedBook.categories.includes(c)
                                )
                        );

                        if (similar.length === 0) {
                            similar = formattedAll.filter((bk) => bk.id !== formattedBook.id);
                        }

                        setSimilarBooks(similar.slice(0, 4));
                    }
                }
            } catch (err) {
                console.error("Error loading book detail:", err);
            }
        };

        fetchBook();
    }, [id]);

    const handleEmailSubmit = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailError('Email address is required.');
            setEmailSuccess('');
        } else if (!emailRegex.test(email)) {
            setEmailError('Email address is invalid.');
            setEmailSuccess('');
        } else {
            setEmailError('');
            setEmailSuccess("Thanks for subscribing! We'll keep you updated.");
            setEmail('');
        }
    };

    const handleAddToCartClick = () => {
        if (!book) return;
        const cartItem = cartItems.find(item => item.id === book.id);

        if (cartItem) {
            setShowRemovePopup(true);
        } else {
            const bookWithQuantity = {
                ...book,
                quantity: quantity,
            };
            addToCart(bookWithQuantity);
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 2000);
        }
    };

    const handleConfirmRemove = () => {
        if (!book) return;
        removeFromCart(book.id);
        setShowRemovePopup(false);
    };

    const handleBuyNow = () => {
        if (!book) return;
        const itemToOrder = {
            ...book,
            quantity: quantity,
        };

        const existing = cartItems.find((item) => item.id === book.id);
        if (!existing || existing.quantity !== quantity) {
            addToCart(itemToOrder);
        }
        navigate("/cart");
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setQuantity('');
        } else {
            const num = parseInt(value);

            if (!isNaN(num) && num > 0) {
                const maxQty = book.stock > 0 ? book.stock : 99;
                setQuantity(Math.min(num, maxQty));
            }
        }
    };

    if (!book) {
        return (
            <div className="container text-center py-5">
                <h2>Loading book details...</h2>
            </div>
        );
    }

    const currentPrice = (book.price * (parseInt(quantity) || 1)).toFixed(2);
    const cartButtonClass = isBookInCart ? "btn-primary text-white" : "btn-light";
    const cartIconClass = isBookInCart ? "bi-cart-fill" : "bi-cart3";

    return (
        <>
            <header className="container-fluid">
                <div className='container pe-0'>
                    <div className='d-flex justify-content-center align-items-center'>
                        <div className='row w-100'>
                            <div className="col-12 d-flex justify-content-between align-items-center pt-3 pb-2 pe-2 ps-0">
                                <h1 className="fw-bold">{book.title}</h1>
                                <button onClick={() => navigate(-1)} className="btn btn-secondary rounded-pill">
                                    <i className="bi bi-arrow-left me-2"></i> Back
                                </button>
                            </div>
                            <div className='col-12 d-flex align-items-center gap-4 py-3 pe-0 ps-0'>
                                <div className='d-flex gap-2 align-items-center'>
                                    <i className="bi bi-person-fill fs-5"></i>
                                    <div>
                                        <p className='text-secondary mb-0'>
                                            <span className='fw-semibold text-black'>{book.author}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className='border-start border-start-2 d-flex gap-2 align-items-center ps-4'>
                                    <i className="bi bi-building fs-5"></i>
                                    <div>
                                        <p className='text-secondary mb-0'>{book.publisher}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <hr className="my-0" />

            <section className="container py-4">
                <div className="d-flex flex-column flex-lg-row gap-4 justify-content-center ps-3 pe-1">
                    <div className="col-12 col-lg-5 rounded-4 overflow-hidden">
                        <img
                            src={book.image}
                            alt={book.title}
                            className='img-fluid rounded-4 shadow-sm'
                            style={{ objectFit: "cover", height: "500px", width: "100%" }}
                        />
                    </div>

                    <div className="col-12 col-lg-7 d-flex flex-column gap-4">
                        <div
                            className="container rounded-4 p-4"
                            style={{ backgroundColor: '#EEF2FF', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
                        >
                            <h4 className="fw-bold mb-3">Book Information</h4>
                            <div className='d-flex justify-content-between align-items-center border-bottom border-secondary'>
                                <p className='fw-semibold text-secondary'>Year of Publication</p>
                                <p className='fw-semibold'>{book.year || 'N/A'}</p>
                            </div>
                            <div className='d-flex justify-content-between align-items-center border-bottom border-secondary my-3'>
                                <p className='fw-semibold text-secondary'>Stock Availability</p>
                                <p className='fw-semibold'>{book.stock > 0 ? `${book.stock} in stock` : 'Out of Stock'}</p>
                            </div>
                            <div className='d-flex justify-content-between align-items-center border-bottom border-secondary my-3'>
                                <p className='fw-semibold text-secondary'>Categories</p>
                                <p className='fw-semibold text-end'>{book.categories.join(', ') || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <span className="fw-semibold text-black me-1 fs-5">Price per unit:</span>
                            <span className="text-primary fw-bold fs-4">${book.price.toFixed(2)}</span>
                        </div>

                        <div className="d-flex align-items-center gap-3 mb-3">
                            <span className='text-black fs-6 fw-semibold'>Quantity:</span>
                            <div className="d-flex align-items-center gap-1">
                                <button
                                    className="btn btn-outline-secondary px-3 py-1"
                                    onClick={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1))}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    style={{ maxWidth: '80px', maxHeight: '40px', fontWeight: 'bold', borderRadius: '8px' }}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                />
                                <button
                                    className="btn btn-outline-secondary px-3 py-1"
                                    onClick={() => setQuantity((parseInt(quantity) || 1) + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div>
                            <span className="fw-semibold text-black me-1 fs-5">Total:</span>
                            <span className="text-danger fw-bold fs-4">${currentPrice}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-shrink-0">
                            <button
                                className="btn btn-dark rounded-pill px-4 flex-grow-1 me-3"
                                onClick={handleBuyNow}
                                disabled={book.stock === 0}
                            >
                                Buy Now
                            </button>

                            <button
                                className={`btn rounded-circle border ${cartButtonClass}`}
                                onClick={handleAddToCartClick}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                disabled={book.stock === 0}
                            >
                                <i className={`bi ${cartIconClass} fs-5`}></i>
                            </button>

                            <button
                                className="btn btn-outline-danger rounded-circle ms-3"
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={() => {
                                    if (favourites.some((f) => f.id === book.id))
                                        removeFromFavourites(book.id);
                                    else addToFavourites(book);
                                }}
                            >
                                <i
                                    className={`bi ${favourites.some((f) => f.id === book.id)
                                        ? "bi-heart-fill text-danger"
                                        : "bi-heart"
                                        }`}
                                ></i>
                            </button>
                        </div>
                        {book.stock === 0 && <small className="text-danger">This item is currently out of stock.</small>}
                    </div>
                </div>
            </section>

            <hr />

            <section className="container my-4">
                <div className="row">
                    <div className="col-lg-7">
                        <h3 className="fw-bold mb-3">About the Book</h3>

                        <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                            {book.description || "This book does not have a description yet."}
                        </p>

                        <p className="text-secondary mt-3">
                            **Placeholder Description:** This novel is a sweeping epic that explores themes of resilience, fate, and the enduring power of human connection across generations. The author masterfully weaves complex subplots into a cohesive, unforgettable narrative that will keep readers turning pages well into the night. It's a journey not just through fictional landscapes, but deep into the human heart.
                        </p>
                        <p className="text-secondary">
                            The world-building is meticulous and rich, painting a vivid picture of a society grappling with rapid change. Every character, no matter how minor, is given depth and a compelling backstory, contributing to the overall tapestry of the story. A must-read for fans of classic literature and modern fantasy alike.
                        </p>

                        <h3 className="fw-bold mb-3 mt-5">Reader Reviews</h3>
                        <div className="border p-3 rounded-3 mb-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★★★ A Stunning Achievement!</p>
                            <p className="text-secondary mb-0">"From the first page, I was completely hooked. The plot twists were genuinely surprising, and the emotional impact was profound. Easily the best book I've read all year. Highly recommended!" - *A Loyal Reader*</p>
                        </div>
                        <div className="border p-3 rounded-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★★ Compelling and Thought-Provoking</p>
                            <p className="text-secondary mb-0">"A brilliant, slow-burn narrative. While the pacing can be dense at times, the payoff is absolutely worth it. It challenges your perspective and leaves you thinking long after you've finished the final chapter." - *Literary Critic*</p>
                        </div>
                    </div>

                    <div className="col-lg-5 ps-lg-5 mt-5 mt-lg-0" style={{ position: 'sticky', top: '90px', alignSelf: 'flex-start' }}>
                        <h5 className="fw-bold mb-3">Other Books in the same category</h5>

                        {similarBooks.length > 0 ? (
                            similarBooks.map((b, index) => (
                                <div className="d-flex mb-3" key={index}>
                                    <Link to={`/book/${b.id}`} className="me-3">
                                        <img
                                            src={b.image}
                                            className="rounded-3"
                                            width="80"
                                            height="120"
                                            alt={b.title}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </Link>
                                    <div>
                                        <Link to={`/book/${b.id}`} className="mb-1 fw-semibold text-decoration-none text-black">
                                            {b.title}
                                        </Link>
                                        <p className="text-muted small mb-1">{b.author}</p>
                                        <p className="text-primary fw-bold mb-0">${b.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No similar books found.</p>
                        )}

                        <div className="text-center bg-info text-white p-4 rounded-4 mt-4">
                            <p className="fw-semibold mb-1">Want more book recommendations?</p>
                            <p className="fw-semibold fs-3">Subscribe to our Newsletter!</p>

                            <div className="d-flex flex-column flex-md-row gap-2 mb-2">
                                <input
                                    type="email"
                                    className="form-control border-0 rounded-3 w-full flex-grow-1"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ height: '45px' }}
                                />
                                <button
                                    className="btn btn-light fw-semibold text-info px-4 rounded-3 w-full md:w-32"
                                    onClick={handleEmailSubmit}
                                    style={{ height: '45px' }}
                                >
                                    Subscribe
                                </button>
                            </div>

                            {emailError && <small className="text-warning d-block">{emailError}</small>}
                            {emailSuccess && <small className="text-light d-block">{emailSuccess}</small>}
                        </div>
                    </div>
                </div>
            </section>

            <hr />

            <section className='container my-5'>
                <div className='d-flex justify-content-center mb-3'>
                    <h3 className="fw-bold">You might also like these books</h3>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {similarBooks.length > 0 ? (
                        similarBooks.map((b) => (
                            <div className="col" key={b.id}>
                                <BookCard
                                    {...b}
                                    addToCart={addToCart}
                                    removeFromCart={removeFromCart}
                                    cartItems={cartItems}
                                    favourites={favourites}
                                    addToFavourites={addToFavourites}
                                    removeFromFavourites={removeFromFavourites}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p className="text-muted">No dishes to display.</p>
                        </div>
                    )}
                </div>
            </section>

            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-box success">
                        <h4>✅ Added to cart successfully!</h4>
                        <p>You have successfully added **{book.title}** to your cart.</p>
                        <div className='popup-btn'>
                            <button onClick={() => setShowSuccessPopup(false)} className="popup-confirm">Continue Shopping</button>
                            <button onClick={() => navigate('/cart')} className="popup-confirm">Go to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            {showRemovePopup && (
                <div className="popup-overlay">
                    <div className="popup-box remove">
                        <h4>Are you sure to remove this book from your cart?</h4>
                        <p className="fw-bold text-center">**{book.title}**</p>
                        <div className='popup-btn'>
                            <button onClick={handleConfirmRemove} className="popup-confirm">Yes, Remove</button>
                            <button onClick={() => setShowRemovePopup(false)} className="popup-remove">No, Keep It</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}