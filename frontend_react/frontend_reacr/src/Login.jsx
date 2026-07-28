import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      // ✅ Updated to point to Node.js Backend URL
      const response = await fetch('https://heart-backend-mern.onrender.com./api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setMessage({ text: 'Login Successful!', type: 'success' });
        
        // LocalStorage lo store cheyadam
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setMessage({ 
          text: data.message || 'User not found! Please Sign Up first.', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Login Error:', err);
      setMessage({ 
        text: 'Failed to connect to backend server.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-base-100 shadow-2xl rounded-3xl border border-base-300">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-primary">Welcome Back!</h2>
          <p className="text-sm text-base-content/60 mt-1">Login to access Heart Health AI</p>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`p-3 mb-4 text-sm font-semibold text-center rounded-xl border ${
            message.type === 'success' 
              ? 'bg-success/10 text-success border-success/20' 
              : 'bg-red-100 text-red-500 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-base-content/80 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@gmail.com"
              autoComplete="off"
              className="input input-bordered w-full rounded-xl focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-base-content/80 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input input-bordered w-full rounded-xl focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary text-primary-content py-3 rounded-xl text-lg font-bold shadow-lg mt-2 normal-case"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-base-content/70">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-bold hover:underline ml-1 cursor-pointer"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}