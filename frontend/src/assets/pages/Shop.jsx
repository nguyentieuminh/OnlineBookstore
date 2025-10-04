import { useEffect, useRef, useMemo, useState } from "react";
import BookCard from "../components/BookCard.jsx";

export default function Shop({
  addToCart,
  removeFromCart,
  cartItems,
  favourites,
  addToFavourites,
  removeFromFavourites
}) {
  const swiperRefs = useRef({});
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [searchPublisher, setSearchPublisher] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/books");
        if (!res.ok) throw new Error("Failed to fetch books");
        const result = await res.json();

        if (result.status && Array.isArray(result.data)) {
          const formatted = result.data.map((book) => ({
            id: book.BookID,
            title: book.BookTitle,
            author: book.Author,
            publisher: book.publisher?.PublisherName || "Unknown",
            price: book.Price,
            description: book.Describe,
            year: book.YearOfPublication,
            quantity: book.Quantity,
            tags: book.tags?.map(t => t.TagName) || [],
            categories: book.categories?.map(c => c.CategoryName) || [],
            image: book.image
              ? book.image.startsWith("http://localhost:8000/")
                ? book.image.replace("http://localhost:8000", "")
                : book.image
              : "/default-book.jpg",
          }));
          setBooks(formatted);
        }
      } catch (err) {
        console.error("Error loading books:", err);
      }
    };

    fetchBooks();
  }, []);

  const categoryList = useMemo(() => {
    const setCat = new Set();
    books.forEach((b) => b.categories.forEach((c) => setCat.add(c)));
    return Array.from(setCat).sort(new Intl.Collator("en").compare);
  }, [books]);

  const filteredBooks = useMemo(() => {
    const makeRegex = (str) => new RegExp(`\\b${str}`, "i");
    const titleRegex = searchTitle ? makeRegex(searchTitle) : null;
    const authorRegex = searchAuthor ? makeRegex(searchAuthor) : null;
    const publisherRegex = searchPublisher ? makeRegex(searchPublisher) : null;

    return books.filter((book) => {
      const matchTitle = !titleRegex || titleRegex.test(book.title);
      const matchAuthor = !authorRegex || authorRegex.test(book.author);
      const matchPublisher = !publisherRegex || publisherRegex.test(book.publisher);
      const matchCategory =
        !selectedCategory || book.categories.includes(selectedCategory);
      return matchTitle && matchAuthor && matchPublisher && matchCategory;
    });
  }, [books, searchTitle, searchAuthor, searchPublisher, selectedCategory]);

  const groupedByTag = useMemo(() => {
    const map = {};
    filteredBooks.forEach((book) => {
      if (!book.tags || book.tags.length === 0) return;
      book.tags.forEach((tag) => {
        if (!map[tag]) map[tag] = [];
        map[tag].push(book);
      });
    });
    return map;
  }, [filteredBooks]);

  const tagList = useMemo(() => {
    return Object.keys(groupedByTag)
      .sort(new Intl.Collator("en").compare)
      .map((tag, idx) => {
        let slug = tag
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (!slug) slug = `tag-${idx}`;
        return { tag, slug: `tag-${slug}` };
      });
  }, [groupedByTag]);

  useEffect(() => {
    if (!window.Swiper) return;

    tagList.forEach(({ slug }) => {
      const container = document.querySelector(`.swiper-${slug}`);
      const paginationEl = container?.querySelector(`.pagination-${slug}`);
      if (!container || !paginationEl) return;

      if (swiperRefs.current[slug]?.destroy) {
        swiperRefs.current[slug].destroy(true, true);
      }

      swiperRefs.current[slug] = new window.Swiper(container, {
        slidesPerView: 4,
        spaceBetween: 20,
        pagination: { el: paginationEl, clickable: true },
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
    });

    return () => {
      Object.values(swiperRefs.current).forEach((swiper) => {
        if (swiper?.destroy) swiper.destroy(true, true);
      });
      swiperRefs.current = {};
    };
  }, [tagList]);

  return (
    <div className="container py-4">
      <h2 className="mb-5 fw-semibold">Shop Books</h2>

      <div className="row mb-5">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by author..."
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by publisher..."
            value={searchPublisher}
            onChange={(e) => setSearchPublisher(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tagList.length === 0 && (
        <div className="container" style={{ height: "155px" }}>
          <p className="text-center fs-3">No books found.</p>
        </div>
      )}

      {tagList.map(({ tag, slug }) => (
        <section key={slug} className="mb-5 text-center">
          <h2 className="fw-semibold mb-2">{tag}</h2>

          <div className={`swiper swiper-${slug}`}>
            <div className="swiper-wrapper">
              {groupedByTag[tag].map((book) => (
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
            <div
              className={`pagination-${slug} mb-3 d-flex justify-content-center`}
            ></div>
          </div>
        </section>
      ))}
    </div>
  );
}
