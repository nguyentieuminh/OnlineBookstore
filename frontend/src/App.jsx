import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom';

import Header from './assets/components/Header.jsx';
import Footer from './assets/components/Footer.jsx';
import NotFound from "./assets/pages/NotFound.jsx";
import Home from './assets/pages/Home.jsx';
import Shop from './assets/pages/Shop.jsx';
import Cart from './assets/pages/Cart.jsx';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loaded]);

  const addToCart = (book) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.title === book.title);
      if (existingIndex >= 0) {
        return prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="App">
      <Header cartItems={cartItems} />

      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} />} />
        <Route path="/shop" element={<Shop addToCart={addToCart} />} />
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
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
