import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './assets/components/Header.jsx';
import Footer from './assets/components/Footer.jsx';
import Home from './assets/pages/Home.jsx';
import Shop from "./assets/pages/Shop.jsx";


function NotFound() {
  return <h1 className='text-center font-bold my-5'> 404 - NotFound </h1>;
}

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/shop" element={<Shop />} />  
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
