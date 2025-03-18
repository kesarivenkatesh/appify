import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';
import Dashboard from './features/Dashboard/Dashboard.js'
import Journal from './features/Dashboard/Journal/Journal.js';
import Music from './features/Dashboard/Music/Music.js';
import Home from './features/Home/Home.js';
import Header from './features/Home/Header.js';
import { useState, useEffect } from 'react';
import { AuthProvider } from './features/AuthContext/AuthContext.js';


function App() {
  
  return (
      <>
      <AuthProvider>
        <BrowserRouter>
          <Header />
            <Routes>
              <Route index element={<Home />} />
              <Route path='/' element={<Home />} />
              
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/music" element={<Music />} />
            </Routes>
          </BrowserRouter>
      </AuthProvider>
      </>

  );
}

export default App;
