import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from "axios";

import Header from './assets/components/Header.jsx';
import Footer from './assets/components/Footer.jsx';
import Home from './assets/pages/Home.jsx';

function NotFound() {
  return <h1 className='text-center font-bold my-5'> 404 - NotFound </h1>;
}

function App() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/users")
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Lỗi API:", err);
      });
  }, []);

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
