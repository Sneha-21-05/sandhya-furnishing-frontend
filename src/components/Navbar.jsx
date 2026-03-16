import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-blue-400 font-semibold"
      : "text-slate-300 hover:text-white transition duration-300";

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center">
          <NavLink to="/" end className="text-2xl font-bold tracking-wide">
            <span className="text-blue-500">Sandhya</span> <span className="text-slate-300">Furnishing</span>
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-base flex-1 ml-10">
          {!isHomePage && (
            <NavLink to="/products" className="text-slate-400 hover:text-white transition duration-300">
              Products
            </NavLink>
          )}
          <NavLink to="/services" className="text-slate-400 hover:text-white transition duration-300">
            Services
          </NavLink>
        </div>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-6">
          {!isHomePage && (
            <NavLink to="/cart" className="flex items-center gap-2 text-slate-400 hover:text-white transition duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Cart
            </NavLink>
          )}
          <NavLink to="/login" className="border border-slate-500 text-slate-300 hover:text-white hover:border-white px-5 py-1.5 rounded-md transition duration-300">
            Sign In
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 px-6 py-6 flex flex-col gap-5 text-base border-t border-slate-700">

          {!isHomePage && (
            <NavLink
              to="/products"
              className="text-slate-300 hover:text-white transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Products
            </NavLink>
          )}

          <NavLink
            to="/services"
            className="text-slate-300 hover:text-white transition duration-300"
            onClick={() => setIsOpen(false)}
          >
            Services
          </NavLink>

          {!isHomePage && (
            <NavLink
              to="/cart"
              className="text-slate-300 hover:text-white transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Cart
            </NavLink>
          )}

          <NavLink
            to="/login"
            className="border border-slate-500 text-center text-slate-300 hover:text-white px-5 py-2 rounded-md transition duration-300"
            onClick={() => setIsOpen(false)}
          >
            Sign In
          </NavLink>

        </div>
      )}
    </nav>
  );
};

export default Navbar;