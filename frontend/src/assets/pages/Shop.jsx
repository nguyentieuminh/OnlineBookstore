// src/assets/pages/Shop.jsx
import { useEffect, useMemo, useState } from "react";
import BookCard from "../components/BookCard";

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
        if (!res.ok) throw new Error("Không thể tải dữ liệu sách");
        const data = await res.json();

        // đảm bảo price là number & làm sạch category
        const cleaned = (Array.isArray(data) ? data : []).map((b, i) => ({
          id: b.id ?? `b${String(i + 1).padStart(3, "0")}`,
          title: String(b.title || "").trim(),
          author: String(b.author || "").trim(),
          price: Number(b.price) || 0,
          description: String(b.description || ""),
          image: b.image || "/Book1.png",
          category: String(b.category || "Khác").trim(),
        }));

        setAllBooks(cleaned);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Lỗi không xác định");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // ====== Derived data ======
  const categories = useMemo(() => {
    const set = new Set(allBooks.map(b => b.category));
    // sắp xếp có dấu cho TV
    const collator = new Intl.Collator("vi");
    return ["all", ...Array.from(set).sort(collator.compare)];
  }, [allBooks]);

  const filteredAndSorted = useMemo(() => {
    const collator = new Intl.Collator("vi", { sensitivity: "base" });
    let arr = allBooks;

    // search theo title (có bỏ dấu/hoa thường)
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      arr = arr.filter(b => b.title.toLowerCase().includes(query));
    }

    // filter theo category
    if (cat !== "all") {
      arr = arr.filter(b => b.category === cat);
    }

    // sort
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
        arr = [...arr]; // giữ nguyên thứ tự
    }

    return arr;
  }, [allBooks, q, cat, sort]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page]);

  // đổi filter/search/sort -> về trang 1
  useEffect(() => {
    setPage(1);
  }, [q, cat, sort]);

  // ====== UI Handlers ======
  const onPrev = () => setPage(p => Math.max(1, p - 1));
  const onNext = () => setPage(p => Math.min(totalPages, p + 1));

  // ====== Render ======
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Đang tải sách…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="mb-2">Có lỗi xảy ra</h5>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Cửa hàng</h1>

      {/* Controls */}
      <div className="row g-3 align-items-stretch mb-2">
        <div className="col-12 col-md-5">
          <input
            className="form-control"
            placeholder="Tìm kiếm theo tên…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>
                {c === "all" ? "Tất cả thể loại" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-4">
          <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="popular">Phổ biến</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A → Z</option>
          </select>
        </div>
      </div>

      <div className="text-muted mb-3">
        Đã tìm thấy {filteredAndSorted.length} cuốn sách
      </div>

      {/* Grid */}
      {pageData.length > 0 ? (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mb-4">
            {pageData.map(b => (
              <div className="col" key={b.id}>
                {/* h-100 để cột kéo cao bằng nhau; bên trong BookCard cũng nên dùng .card.h-100 */}
                <div className="h-100">
                  <BookCard {...b} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button className="btn btn-outline-primary" disabled={page === 1} onClick={onPrev}>
                ‹ Trước
              </button>
              <span className="text-muted">
                Trang {page}/{totalPages}
              </span>
              <button
                className="btn btn-outline-primary"
                disabled={page === totalPages}
                onClick={onNext}
              >
                Sau ›
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted fs-5 mb-1">Không tìm thấy sách phù hợp</p>
          <p className="text-muted mb-0">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  );
}
