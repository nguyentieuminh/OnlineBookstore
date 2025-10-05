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

    const cartItem = cartItems.find(
        (item) => item.BookID === book?.id || item.book?.BookID === book?.id
    );

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (cartItem) {
            setQuantity(cartItem.Quantity);
        } else {
            setQuantity(1);
        }
    }, [cartItem]);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showRemovePopup, setShowRemovePopup] = useState(false);

    const isInCart = book && Array.isArray(cartItems) &&
        cartItems.some((item) => item.BookID === book.id || item.book?.BookID === book.id);

    const isFavourite = book && Array.isArray(favourites) &&
        favourites.some((fav) => fav.id === book.id);

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

    const handleFavouriteClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const currentBook = {
            id: book.id,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            price: book.price,
            description: book.description,
            image: book.image,
            categories: book.categories,
            tags: book.tags,
        };

        if (favourites.some((f) => f.id === book.id)) {
            removeFromFavourites(book.id);
        } else {
            addToFavourites(currentBook);
        }
    };

    const handleAddToCartClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const isInCart = cartItems.some(
            (item) => item.BookID === book.id || item.book?.BookID === book.id
        );

        if (isInCart) {
            removeFromCart(cartItem.CartID);
        } else {
            addToCart({ ...book, quantity });
        }
    };

    const handleConfirmRemove = () => {
        if (!book) return;
        removeFromCart(book.id);
        setShowRemovePopup(false);
    };

    const handleBuyNow = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
    };

    const handleQuantityChange = (newQty) => {
        if (newQty < 1) newQty = 1;
        if (book && newQty > book.stock) newQty = book.stock;

        setQuantity(newQty);

        if (cartItem) {

        }
    };

    if (!book) {
        return (
            <div className="container text-center py-5">
                <h2>Loading book details...</h2>
            </div>
        );
    }

    const currentPrice = (book.price * quantity).toFixed(2);

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

                    <div className="col-12 col-lg-7 d-flex flex-column gap-3">
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
                            <span className="fw-bold fs-4" style={{ color: "#6366F1" }}>${book.price.toFixed(2)}</span>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="text-black fs-6 fw-semibold">Quantity:</span>

                            <div className="d-flex align-items-center rounded overflow-hidden quantity-control"
                                style={{ border: "1px solid #000", width: "140px", height: "35px" }}>

                                <button
                                    className="btn btn-sm bg-light flex-fill"
                                    style={{ borderRight: "1px solid #000", borderRadius: 0 }}
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={book.stock === 0}
                                >
                                    –
                                </button>

                                <input
                                    type="text"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val) && val > 0) {
                                            handleQuantityChange(val);
                                        }
                                    }}
                                    className="form-control form-control-sm text-center flex-fill"
                                    style={{ border: "none", borderRadius: 0, boxShadow: "none", width: "40px" }}
                                    disabled={book.stock === 0}
                                />

                                <button
                                    className="btn btn-sm bg-light flex-fill"
                                    style={{ borderLeft: "1px solid #000", borderRadius: 0 }}
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={book.stock === 0}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div>
                            <span className="fw-semibold text-black me-1 fs-5">Total:</span>
                            <span className="text-danger fw-bold fs-4">${currentPrice}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2 gap-2">
                            <button
                                className="btn rounded-pill px-4 py-2 flex-grow-1 me-2"
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
                                onClick={handleBuyNow}
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

                            <button
                                className="btn btn-light rounded-circle ms-2"
                                onClick={handleFavouriteClick}
                            >
                                <i
                                    className={`bi ${isFavourite ? "bi-heart-fill text-danger" : "bi-heart"}`}
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
                            This novel is an expansive and deeply immersive story that captures the struggles,
                            triumphs, and quiet moments of humanity. With every chapter, the reader is drawn into
                            a world that feels both fantastical and intimately familiar. The author demonstrates
                            an extraordinary ability to balance lyrical prose with fast-paced narrative,
                            creating a reading experience that is at once profound and exhilarating.
                        </p>

                        <p className="text-secondary">
                            What sets this book apart is its layered exploration of universal themes:
                            love and loss, resilience in the face of adversity, and the constant search
                            for meaning in a rapidly changing world. Characters are brought to life with
                            incredible depth, their relationships filled with nuance and emotional authenticity.
                            The world-building, meanwhile, is vivid and detailed, pulling readers into a
                            setting so realistic it almost breathes on its own.
                        </p>

                        <p className="text-secondary">
                            Beyond its plot, this book invites readers to reflect on their own lives,
                            posing questions that linger long after the final page is turned. It's more than
                            a story — it's a journey that will challenge perspectives, ignite emotions,
                            and leave an indelible mark on the heart.
                        </p>

                        <h3 className="fw-bold mb-3 mt-5">Reader Reviews</h3>

                        <div className="border p-3 rounded-3 mb-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★★★ A Masterpiece of Storytelling</p>
                            <p className="text-secondary mb-0">
                                "I was hooked from the very first page. The author weaves a tale that feels
                                both grand and personal, with twists that genuinely surprised me. The emotional
                                resonance of the characters is unmatched — I laughed, I cried, and I found
                                myself pausing to simply savor the writing. Easily the best book I’ve read
                                in years." — <em>A Devoted Reader</em>
                            </p>
                        </div>

                        <div className="border p-3 rounded-3 mb-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★★ Thought-Provoking and Richly Layered</p>
                            <p className="text-secondary mb-0">
                                "While the pacing may feel deliberate at times, every chapter rewards patience
                                with profound insights and stunning imagery. This is not just a story you read —
                                it’s one you live alongside the characters. The philosophical undertones
                                will stay with me for a long time. Highly recommended for readers who enjoy
                                books that make them think." — <em>Literary Enthusiast</em>
                            </p>
                        </div>

                        <div className="border p-3 rounded-3 mb-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★★★ Unforgettable Journey</p>
                            <p className="text-secondary mb-0">
                                "This book is a rare gem — the kind of novel you want to press into the hands
                                of everyone you know. It’s heartfelt, adventurous, and beautifully written.
                                The way the author captures human emotions is extraordinary. I know I’ll be
                                rereading this again and again." — <em>Passionate Book Lover</em>
                            </p>
                        </div>

                        <div className="border p-3 rounded-3" style={{ borderColor: '#dee2e6!important' }}>
                            <p className="fw-bold mb-1">★★★ A Bit Dense but Rewarding</p>
                            <p className="text-secondary mb-0">
                                "At times the narrative felt a little heavy, but by the end I realized that
                                the slower pace added richness and depth. The characters and themes make
                                the journey worthwhile. If you’re looking for a book that challenges and
                                rewards in equal measure, this is it." — <em>Critical Thinker</em>
                            </p>
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
                                            height="80"
                                            alt={b.title}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </Link>
                                    <div className="d-flex flex-column">
                                        <Link
                                            to={`/book/${b.id}`}
                                            className="mb-1 fw-semibold text-decoration-none text-black"
                                        >
                                            {b.title}
                                        </Link>

                                        <p className="small mb-2">
                                            {b.author && <span className="fw-semibold text-primary">{b.author}</span>}
                                            {b.publisher && (
                                                <>
                                                    <span className="mx-1 text-muted">•</span>
                                                    <span className="text-muted">{b.publisher}</span>
                                                </>
                                            )}
                                        </p>

                                        <h6 className="fw-bold fs-6 mb-0" style={{ color: "#6366F1" }}>
                                            ${b.price.toFixed(2)}
                                        </h6>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No similar books found.</p>
                        )}

                        <div
                            className="text-center text-white p-4 rounded-4 mt-4"
                            style={{ backgroundColor: "#6366F1" }}
                        >
                            <p className="fw-semibold mb-1">Want to explore more books?</p>
                            <p className="fw-semibold fs-3">Discover our full collection!</p>

                            <Link
                                to="/shop"
                                className="btn fw-semibold px-4 rounded-3 mt-1"
                                style={{
                                    height: "45px",
                                    backgroundColor: "#fff",
                                    color: "#6366F1",
                                    border: "none",
                                }}
                            >
                                Explore Shop
                            </Link>
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
                            <p className="text-muted">No books to display.</p>
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
