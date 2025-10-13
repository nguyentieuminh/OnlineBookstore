import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./assets/components/Header.jsx";
import Footer from "./assets/components/Footer.jsx";
import NotFound from "./assets/pages/NotFound.jsx";
import Home from "./assets/pages/Home.jsx";
import Shop from "./assets/pages/Shop.jsx";
import Cart from "./assets/pages/Cart.jsx";
import Login from "./assets/pages/Login.jsx";
import SignUp from "./assets/pages/SignUp.jsx";
import BookDetail from "./assets/pages/BookDetail.jsx";
import UserProfile from "./assets/pages/UserProfile.jsx";
import Orders from "./assets/pages/Orders.jsx";
import OrderForm from "./assets/pages/OrderForm.jsx";
import ProtectedRoute from "./assets/components/ProtectedRoute.jsx";
import AdminHeader from "./assets/components/AdminHeader.jsx";
import AdminOrders from "./assets/pages/AdminOrders.jsx";
import AdminBookManagement from "./assets/pages/AdminBookManagement.jsx";
import AdminAddNewBook from "./assets/pages/AdminAddNewBook.jsx";

import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [cartItems, setCartItems] = useState([]);
  const [favourites, setFavourites] = useState([]);

  const fetchCart = async () => {
    try {
      const data = await apiGet("cart");
      const normalized = (data.data || []).map(item => ({
        ...item,
        CartID: item.CartID || item.id
      }));
      setCartItems(normalized);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (book) => {
    try {
      await apiPost("cart", {
        BookID: book.id || book.BookID,
        Quantity: book.quantity || 1,
      });
      fetchCart();
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      await apiPut(`cart/${id}`, { Quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await apiDelete(`cart/${id}`);
      fetchCart();
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng:", err);
    }
  };

  const addToFavourites = (book) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.id === book.id)) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeFromFavourites = (id) => {
    setFavourites((prev) => prev.filter((item) => item.id !== id));
  };

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('bookstore-orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookstore-orders', JSON.stringify(orders));
  }, [orders]);

  const genOrderId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const handlePlaceOrderFromCart = (items) => {
    const now = new Date().toISOString();
    const normalized = (items || []).map(it => ({
      id: genOrderId(),
      items: [it],
      status_ref: { label: "Pending Confirmation", color: "#6c757d", code: "pending" },
      order_date: now,
      total: Number(it.price) * Number(it.quantity),
      discount_total: 0,
      address: localStorage.getItem('order_address') || '',
      recipient_info: JSON.parse(localStorage.getItem('order_recipient') || '{}'),
      note: '',
    }));

    setOrders(prev => {
      const next = [...prev, ...normalized];
      localStorage.setItem('bookstore-orders', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="App">

      {isAdminRoute ? (
        <AdminHeader />
      ) : (
        <Header cartItems={cartItems} favourites={favourites} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cartItems={cartItems}
              favourites={favourites}
              addToFavourites={addToFavourites}
              removeFromFavourites={removeFromFavourites}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cartItems={cartItems}
              favourites={favourites}
              addToFavourites={addToFavourites}
              removeFromFavourites={removeFromFavourites}
            />
          }
        />

        <Route
          path="/book/:id"
          element={
            <BookDetail
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cartItems={cartItems}
              favourites={favourites}
              addToFavourites={addToFavourites}
              removeFromFavourites={removeFromFavourites}
              updateQuantity={updateQuantity}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              items={cartItems}
              setItems={setCartItems}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              onPlaceOrder={handlePlaceOrderFromCart}
            />
          }
        />

        <Route path="/orderform" element={<OrderForm setOrders={setOrders} setItems={setCartItems} />} />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/profile"
          element={<UserProfile></UserProfile>}
        >
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/books"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBookManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/book/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAddNewBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/book/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAddNewBook />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
