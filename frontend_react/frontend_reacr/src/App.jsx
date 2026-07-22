import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom"; 
import Navbar from "./Navbar"; 
import Signup from "./Signup"; 
import Login from "./Login"; 
import Contact from "./Contact"; 
import Predict from "./Predict"; 
import About from "./About"; // 👈 1. About కాంపోనెంట్ ఇంపోర్ట్ చేసాం

export default function App() {
  // 🎯 యూజర్ లాగిన్ అయ్యారా లేదా చెక్ చేయడానికి స్టేట్
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif !important;
        }
        
        a {
          text-decoration: none !important;
        }
      `}} />

      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
        {/* Navbar కి user details & logout function పాస్ చేస్తున్నాం */}
        <Navbar user={user} onLogout={handleLogout} />
      
        {/* 📋 రౌటింగ్ సెటప్ */}
        <Routes>
          {/* 🏠 1. హోమ్ పేజీ రౌట్ (/) */}
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
              
              {/* 👈 ఎడమ వైపు: టెక్స్ట్ కంటెంట్ */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                  Welcome to <span className="text-primary">HeartAI</span>
                </h1>
                
                <p className="text-xl opacity-80 mt-6 max-w-lg leading-relaxed text-justify pr-4">
                  <span className="text-red-500 font-bold">Save the Heart</span> is a message that encourages people to take care of their heart through healthy daily habits. Regular exercise, a balanced diet, avoiding tobacco, managing stress, and getting enough sleep can greatly reduce the risk of heart disease. Regular health checkups also help detect problems early. A healthy heart supports a healthier, longer, and more active life.
                </p>
                
                {/* 🎯 బటన్స్ - లాగిన్ కాకపోతే Login / Signup చూపిస్తుంది */}
                <div className="mt-8 flex gap-4 justify-center lg:justify-start">
                  {!user ? (
                    <>
                      <Link to="/login" className="btn btn-primary px-8 text-lg flex items-center justify-center">
                        Login
                      </Link>
                      <Link to="/signup" className="btn btn-outline btn-primary px-8 text-lg flex items-center justify-center">
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <Link to="/predict" className="btn btn-primary px-8 text-lg flex items-center justify-center">
                      Get Heart Assessment
                    </Link>
                  )}
                </div>
              </div>

              {/* 👉 కుడి వైపు: ఇమేజ్ సెక్షన్ */}
              <div className="w-full flex justify-end items-center mt-10 lg:mt-16">
                <img 
                  src="/heart1.png" 
                  alt="HeartAI Banner" 
                  className="w-full max-w-md lg:max-w-xl rounded-2xl shadow-2xl object-cover transform hover:scale-105 transition-transform duration-300 lg:translate-x-12"
                />
              </div>
            </div>
          } />

          {/* ℹ️ 2. అబౌట్ పేజీ రౌట్ (/about) - 👈 2. ఇక్కడ అబౌట్ రౌట్ యాడ్ చేసాం */}
          <Route path="/about" element={<About />} />

          {/* 🔑 3. లాగిన్ పేజీ రౌట్ (/login) */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* 📝 4. సైన్అప్ పేజీ రౌట్స్ (/signup & /register) */}
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/" /> : <Signup onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/" /> : <Signup onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* 🩺 5. ప్రిడిక్షన్ పేజీ రౌట్ (/predict) - లాగిన్ ఐతేనే ఓపెన్ అవుతుంది */}
          <Route 
            path="/predict" 
            element={
              user ? <Predict /> : <Navigate to="/login" replace />
            } 
          />

          {/* 📩 6. కాంటాక్ట్ పేజీ రౌట్ (/contact) - లాగిన్ ఐతేనే ఓపెన్ అవుతుంది */}
          <Route 
            path="/contact" 
            element={
              user ? <Contact user={user} /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
        
      </div>
    </Router>
  );
}