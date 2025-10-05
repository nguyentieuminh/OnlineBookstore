import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

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
import AdminManageBooks from "./assets/pages/AdminManageBooks.jsx";

import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

function App() {
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
      await apiPost("cart/add", {
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
      await apiPut(`cart/update/${id}`, { Quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await apiDelete(`cart/remove/${id}`);
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


  return (
    <div className="App">
      <Header cartItems={cartItems} favourites={favourites} />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cartItems={cartItems}
              favourites={favourites}
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
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              items={cartItems}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          }
        />

        <Route
          path="/profile"
          element={<UserProfile></UserProfile>}
        >
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/adminmanagebooks" element={<AdminManageBooks />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
