import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
=======
import axios from "axios";
>>>>>>> 95bc5cffdc55b0420a378b5c9587aa919696870f

import Header from './assets/components/Header.jsx';
import Footer from './assets/components/Footer.jsx';
import Home from './assets/pages/Home.jsx';
<<<<<<< HEAD
import Shop from "./assets/pages/Shop.jsx";

=======
>>>>>>> 95bc5cffdc55b0420a378b5c9587aa919696870f

function NotFound() {
  return <h1 className='text-center font-bold my-5'> 404 - NotFound </h1>;
}

function App() {
<<<<<<< HEAD
=======

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

>>>>>>> 95bc5cffdc55b0420a378b5c9587aa919696870f
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
<<<<<<< HEAD
         <Route path="/shop" element={<Shop />} />  
=======
>>>>>>> 95bc5cffdc55b0420a378b5c9587aa919696870f
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
