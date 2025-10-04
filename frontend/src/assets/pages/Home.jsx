import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import "../css/Home.css";
import BookCard from "../components/BookCard.jsx";

import Books1 from "../images/Home/Books1.jpg";
import Books2 from "../images/Home/Books2.png";
import Award from "../images/Home/Award.png";

export default function Home({
    addToCart,
    removeFromCart,
    cartItems,
    favourites,
    addToFavourites,
    removeFromFavourites
}) {
    const [books, setBooks] = useState([]);
    const swiperBestRef = useRef(null);
    const swiperNewRef = useRef(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/books");
                if (!res.ok) throw new Error("Failed to fetch books");
                const result = await res.json();

                if (result.status && Array.isArray(result.data)) {
                    const formattedBooks = result.data.map((book) => ({
                        id: book.BookID,
                        title: book.BookTitle,
                        author: book.Author,
                        description: book.Describe,
                        price: book.Price,
                        year: book.YearOfPublication,
                        quantity: book.Quantity,
                        tags: book.tags?.map(t => t.TagName) || [],
                        categories: book.categories?.map(c => c.CategoryName) || [],
                        publisher: book.publisher?.PublisherName || "Unknown",
                        image: book.image
                            ? book.image.startsWith('http://localhost:8000/')
                                ? book.image.replace('http://localhost:8000', '')
                                : book.image
                            : '/default-book.jpg',
                    }));

                    setBooks(formattedBooks);
                }
            } catch (err) {
                console.error("Error loading books:", err);
            }
        };

        fetchBooks();
    }, []);

    useEffect(() => {
        if (!window.Swiper) return;

        swiperBestRef.current = new window.Swiper(".bestSellerSwiper", {
            slidesPerView: 4,
            spaceBetween: 20,
            pagination: { el: ".bestSeller-pagination", clickable: true },
            grabCursor: true,
            observer: true,
            observeParents: true,
            breakpoints: {
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
            },
        });

        swiperNewRef.current = new window.Swiper(".newReleaseSwiper", {
            slidesPerView: 4,
            spaceBetween: 20,
            pagination: { el: ".newRelease-pagination", clickable: true },
            grabCursor: true,
            observer: true,
            observeParents: true,
            breakpoints: {
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
            },
        });

        return () => {
            if (swiperBestRef.current?.destroy) swiperBestRef.current.destroy(true, true);
            if (swiperNewRef.current?.destroy) swiperNewRef.current.destroy(true, true);
        };
    }, [books]);

    return (
        <div className="home-page py-5">
            <section className="container">
                <div
                    className="row align-items-stretch overflow-hidden"
                    style={{
                        height: "550px",
                        borderRadius: "20px",
                        backgroundColor: "#EEEEEE",
                    }}
                >
                    <div
                        className="col-md-6 d-flex flex-column justify-content-center px-5 h-100"
                        style={{ backgroundColor: "#EEEEEE" }}
                    >
                        <h1 className="fw-bold" style={{ fontSize: "2.5rem", lineHeight: "1.2" }}>
                            Buy your books <br />
                            <span style={{ color: "#6366F1" }}>for the best prices</span>
                        </h1>
                        <p className="text-muted mt-3" style={{ fontSize: "1rem" }}>
                            Find and read more you'll love, and keep track of the books you
                            want to read. <br />
                            Be part of the world's largest community of book lovers.
                        </p>

                        <div className="btn px-4 py-2 rounded-2 explore-btn mt-3" style={{ width: "fit-content" }}>
                            <Link to="/shop" style={{ textDecoration: 'none', color: '#fff' }}>
                                Go to Shop
                            </Link>
                        </div>
                    </div>

                    <div className="col-md-6 p-0" style={{ overflow: "hidden" }}>
                        <img
                            src={Books1}
                            alt="Books"
                            className="w-100 h-100"
                            style={{
                                objectFit: "cover",
                                borderTopRightRadius: "20px",
                                borderBottomRightRadius: "20px",
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="container text-center mt-5">
                <h2 className="fw-semibold mb-4">Best Seller Books</h2>
                <div className="swiper bestSellerSwiper">
                    <div className="swiper-wrapper">
                        {books
                            .filter((book) => book.tags.includes("Best Seller"))
                            .map((book) => (
                                <div className="swiper-slide" key={book.id}>
                                    <BookCard
                                        {...book}
                                        addToCart={addToCart}
                                        removeFromCart={removeFromCart}
                                        cartItems={cartItems}
                                        favourites={favourites}
                                        addToFavourites={addToFavourites}
                                        removeFromFavourites={removeFromFavourites}
                                    />
                                </div>
                            ))}
                    </div>
                    <div className="bestSeller-pagination"></div>
                </div>
            </section>

            <section className="container mt-4">
                <div className="row align-items-center py-4 g-5">
                    <div className="col-12 col-md-6 mb-4">
                        <img src={Books2} alt="Books" className="w-100 rounded-3" />
                    </div>
                    <div className="col-12 col-md-6">
                        <h2 className="fw-bold mb-3">
                            Find Your Favorite <br />
                            <span style={{ color: "#6366F1" }}>Book Here!</span>
                        </h2>
                        <p className="text-muted mb-4">
                            Discover top-rated books in fiction, fantasy, and business. Join the community and enjoy reading.
                        </p>

                        <div className="d-flex gap-5 mb-4 flex-wrap">
                            <div>
                                <h4 className="fw-bold mb-0">{books.length}+</h4>
                                <small className="text-muted">Books Available</small>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">550+</h4>
                                <small className="text-muted">Registered Users</small>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0">1,200+</h4>
                                <small className="text-muted">Books Sold</small>
                            </div>
                        </div>

                        <div className="btn px-4 py-2 rounded-2 explore-btn">
                            <Link to="/shop" style={{ textDecoration: 'none', color: '#fff' }}>Explore Now</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section
                className="container mt-5 award-section d-flex align-items-center justify-content-between px-5"
                style={{
                    backgroundColor: "#FEF9C3",
                    borderRadius: "20px",
                    height: "300px",
                }}
            >
                <div>
                    <h3 className="fw-bold mb-4">
                        2025 National Book Awards for Fiction Shortlist
                    </h3>
                    <Link
                        to="/shop"
                        className="btn px-4 py-2 rounded-2 explore-btn text-white"
                    >
                        Explore Now
                    </Link>
                </div>
                <div className="h-100 d-flex align-items-center">
                    <img
                        src={Award}
                        alt="Award"
                        style={{ height: "250px", objectFit: "contain" }}
                    />
                </div>
            </section>

            <section className="container text-center mt-5">
                <h2 className="fw-semibold mb-4">New Releases</h2>
                <div className="swiper newReleaseSwiper">
                    <div className="swiper-wrapper">
                        {books
                            .filter((book) => book.tags.includes("New Releases"))
                            .map((book) => (
                                <div className="swiper-slide" key={book.id}>
                                    <BookCard
                                        {...book}
                                        addToCart={addToCart}
                                        removeFromCart={removeFromCart}
                                        cartItems={cartItems}
                                        favourites={favourites}
                                        addToFavourites={addToFavourites}
                                        removeFromFavourites={removeFromFavourites}
                                    />
                                </div>
                            ))}
                    </div>
                    <div className="newRelease-pagination"></div>
                </div>
            </section>
        </div>
    );
}
