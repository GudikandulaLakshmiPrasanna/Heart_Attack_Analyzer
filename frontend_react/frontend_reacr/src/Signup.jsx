import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      // ✅ Render Backend API URL ఇక్కడ అప్‌డేట్ చేసాం
      const response = await fetch('https://heart-attack-analyzer.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setMessage({ text: 'Signup Successful! Redirecting...', type: 'success' });
        const userData = { name: formData.name, email: formData.email };
        localStorage.setItem("user", JSON.stringify(userData));

        if (onLoginSuccess) onLoginSuccess(userData);

        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setMessage({ text: data.message || 'Signup failed!', type: 'error' });
      }
    } catch (err) {
      console.error('Signup Error:', err);
      setMessage({ text: 'Failed to connect to backend server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-base-100 shadow-2xl rounded-3xl border border-base-300">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-primary">Create Account</h2>
          <p className="text-sm text-base-content/60 mt-1">Join HeartAI to monitor your health</p>
        </div>

        {message.text && (
          <div className={`p-3 mb-4 text-sm font-semibold text-center rounded-xl border ${
            message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-red-100 text-red-500 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-base-content/80">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="John Doe" 
              autoComplete="off"
              className="input input-bordered w-full rounded-xl focus:outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-base-content/80">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="patient@example.com" 
              autoComplete="off"
              className="input input-bordered w-full rounded-xl focus:outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-base-content/80">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              autoComplete="new-password"
              className="input input-bordered w-full rounded-xl focus:outline-none" 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 rounded-xl text-lg font-bold shadow-lg mt-2 normal-case">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-base-content/70">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
        </div>
      </div>
    </div>
  );
}