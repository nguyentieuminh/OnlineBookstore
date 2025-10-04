import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';

import Header from './assets/components/Header.jsx';
import Footer from './assets/components/Footer.jsx';
import NotFound from "./assets/pages/NotFound.jsx";
import Home from './assets/pages/Home.jsx';
import Shop from './assets/pages/Shop.jsx';
import Cart from './assets/pages/Cart.jsx';
import Login from "./assets/pages/Login.jsx";
import SignUp from "./assets/pages/SignUp.jsx";
import BookDetail from "./assets/pages/BookDetail.jsx";
import AdminManageBooks from "./assets/pages/AdminManageBooks.jsx";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedFav = localStorage.getItem("favourites");

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedFav) {
      setFavourites(JSON.parse(storedFav));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      localStorage.setItem("favourites", JSON.stringify(favourites));
    }
  }, [cartItems, favourites, loaded]);

  const addToCart = (book) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === book.id);
      if (existingIndex >= 0) {
        return prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (index, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const addToFavourites = (book) => {
    setFavourites((prev) => {
      if (prev.some((fav) => fav.id === book.id)) return prev;
      return [...prev, book];
    });
  };

  const removeFromFavourites = (id) => {
    setFavourites((prev) => prev.filter((fav) => fav.id !== id));
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
        <Route path="*" element={<NotFound />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/adminmanagebooks" element={<AdminManageBooks />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
