import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const [currentTheme, setCurrentTheme] = useState('light');

  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <nav className="flex justify-between items-center w-full px-10 py-5 border-b shadow-sm bg-base-100 text-base-content transition-all duration-300">
      <div>
        <Link to="/" className="text-3xl font-bold no-underline text-current">HeartAI</Link>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-semibold no-underline text-current">Home</Link>
          
          {/* User logged means for Assessment page , or  Register page  */}
          {user ? (
            <Link to="/predict" className="text-lg font-semibold no-underline text-current">
              Assessment
            </Link>
          ) : (
            <Link to="/signup" className="text-lg font-semibold no-underline text-current">
              Register
            </Link>
          )}

          <Link to="/contact" className="text-lg font-semibold no-underline text-current">Contact</Link>
          <Link to="/about" className="text-lg font-semibold no-underline text-current">About</Link>
        </div>

        {/* 🎨 DaisyUI  option here */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn m-1 font-semibold flex items-center gap-2 capitalize">
            Theme ({currentTheme})
            <svg width="12px" height="12px" className="inline-block h-2 w-2 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content bg-base-300 text-base-content rounded-box z-50 w-52 p-2 shadow-2xl menu">
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Default"
                value="light"
                checked={currentTheme === "light"}
                onChange={() => setCurrentTheme("light")} />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Retro"
                value="retro"
                checked={currentTheme === "retro"}
                onChange={() => setCurrentTheme("retro")} />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Cyberpunk"
                value="cyberpunk"
                checked={currentTheme === "cyberpunk"}
                onChange={() => setCurrentTheme("cyberpunk")} />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Valentine"
                value="valentine"
                checked={currentTheme === "valentine"}
                onChange={() => setCurrentTheme("valentine")} />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Aqua"
                value="aqua"
                checked={currentTheme === "aqua"}
                onChange={() => setCurrentTheme("aqua")} />
            </li>
          </ul>
        </div>

        {/* 🎯 LOGIN / LOGOUT DYNAMIC BUTTON */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg">Hi, {user.name || 'User'}</span>
            <button 
              onClick={onLogout} 
              className="btn btn-error px-6 font-bold text-lg text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-neutral px-6 font-bold text-lg no-underline flex items-center justify-center">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}