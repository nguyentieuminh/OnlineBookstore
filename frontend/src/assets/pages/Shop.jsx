// src/assets/pages/Shop.jsx
import { useEffect, useMemo, useState } from "react";

/* ==== Inline Card (no external CSS, self-contained) ==== */
function Card({ book }) {
  const s = {
    col: { display: "flex" }, // let the card stretch to full column height
    card: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      border: "none",
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,.06)",
      background: "#fff",
      overflow: "hidden",
      width: "100%",
    },
    imgWrap: {
      // fixed 3:4 aspect ratio
      width: "100%",
      position: "relative",
      paddingTop: "133.3333%", // 4/3 * 100
      background: "#eef3ff",
      overflow: "hidden",
    },
    img: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    body: {
      display: "flex",
      flexDirection: "column",
      padding: "16px",
      flexGrow: 1,
    },
    title: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: 6,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    author: {
      fontSize: ".9rem",
      color: "#4f46e5",
      marginBottom: 8,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    desc: {
      fontSize: ".9rem",
      color: "#6b7280",
      marginBottom: 12,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      minHeight: "4.2em", // ~3 lines for even height
      lineHeight: 1.4,
    },
    price: { fontWeight: 700, marginBottom: 10, color: "#1e1b4b" },
    btn: {
      width: "100%",
      padding: "10px 12px",
      background: "#111827",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontWeight: 500,
      cursor: "pointer",
    },
  };

  return (
    <div style={s.col} className="col">
      <div style={s.card}>
        <div style={{ padding: 12 }}>
          <div style={s.imgWrap}>
            <img src={book.image} alt={book.title} style={s.img} />
          </div>
        </div>
        <div style={s.body}>
          <h5 style={s.title}>{book.title}</h5>
          <div style={s.author}>{book.author}</div>
          <p style={s.desc}>{book.description}</p>

          {/* push price + button to bottom */}
          <div style={{ marginTop: "auto" }}>
            <div style={s.price}>
              {Number(book.price).toLocaleString()} USD
            </div>
            <button style={s.btn}>🛒 Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  // ====== State ======
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI controls
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular"); // popular | price-asc | price-desc | name-asc
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // ====== Fetch JSON ======
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/books.json", { signal: ac.signal });
        if (!res.ok) throw new Error("Failed to load book data");
        const data = await res.json();

        const cleaned = (Array.isArray(data) ? data : []).map((b, i) => ({
          id: b.id ?? `b${String(i + 1).padStart(3, "0")}`,
          title: String(b.title || "").trim(),
          author: String(b.author || "").trim(),
          price: Number(b.price) || 0,
          description: String(b.description || ""),
          image: b.image || "/Book1.png",
          category: String(b.category || "Other").trim(),
        }));
        setAllBooks(cleaned);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // ====== Derived data ======
  const categories = useMemo(() => {
    const set = new Set(allBooks.map((b) => b.category));
    const collator = new Intl.Collator("en");
    return ["all", ...Array.from(set).sort(collator.compare)];
  }, [allBooks]);

  const filteredAndSorted = useMemo(() => {
    const collator = new Intl.Collator("en", { sensitivity: "base" });
    let arr = allBooks;

    if (q.trim()) {
      const query = q.trim().toLowerCase();
      arr = arr.filter((b) => b.title.toLowerCase().includes(query));
    }
    if (cat !== "all") arr = arr.filter((b) => b.category === cat);

    switch (sort) {
      case "price-asc":
        arr = [...arr].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr = [...arr].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        arr = [...arr].sort((a, b) => collator.compare(a.title, b.title));
        break;
      case "popular":
      default:
        arr = [...arr];
    }
    return arr;
  }, [allBooks, q, cat, sort]);

  // ====== Pagination ======
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [q, cat, sort]);

  // clamp page when totalPages changes
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), Math.max(1, totalPages)));
  }, [totalPages]);

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // ====== Render ======
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading books…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="mb-2">An error occurred</h5>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Shop</h1>

      {/* Controls */}
      <div className="row g-3 align-items-stretch mb-2">
        <div className="col-12 col-md-5">
          <input
            className="form-control"
            placeholder="Search by title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-4">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Title: A → Z</option>
          </select>
        </div>
      </div>

      <div className="text-muted mb-3">
        Found {filteredAndSorted.length} books
      </div>

      {/* Grid – equal column height; card stretches to fill */}
      {pageData.length > 0 ? (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 align-items-stretch mb-4">
            {pageData.map((b) => (
              <Card key={b.id} book={b} />
            ))}
          </div>

          {/* Pagination */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Prev
            </button>

            <div className="d-flex flex-wrap gap-2 mx-2">
              {pages.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`btn ${n === page ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <span className="text-muted mx-1">
              Page {page}/{totalPages}
            </span>

            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next ›
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted fs-5 mb-1">No matching books found</p>
          <p className="text-muted mb-0">Try adjusting filters or your search query</p>
        </div>
      )}
    </div>
  );
}
