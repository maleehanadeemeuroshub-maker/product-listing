import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Store,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-900/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/products"
            className="group flex items-center gap-2.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Store className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-['Space_Grotesk'] text-slate-900 flex items-center gap-1">
                Shoply<span className="text-cyan-400">.io</span>
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase -mt-1">
                REST API Dashboard
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              All Products
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Shopping Cart
            </NavLink>
          </nav>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3">
          
          {/* Cart Page Link with Counter Badge */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-900/10 hover:border-cyan-500/40 text-slate-700 hover:text-slate-900 transition-all shadow-md group"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-mono text-xs font-semibold">Cart</span>
            <span className="px-1.5 py-0.5 rounded-md bg-cyan-500 text-black font-mono font-extrabold text-xs min-w-[20px] text-center">
              {totalItems}
            </span>
          </Link>

          {/* Authentication State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-2xl glass-panel border border-cyan-500/40">
                <img
                  src={user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.firstName}
                  className="w-7 h-7 rounded-xl object-cover border border-cyan-400/50"
                />
                <span className="text-xs font-mono font-bold text-slate-900">
                  {user.firstName || user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl glass-panel border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 glass-panel"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900/10 px-4 py-4 space-y-3 bg-white/98">
          <NavLink
            to="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-mono text-slate-600 hover:text-cyan-400"
          >
            All Products
          </NavLink>
          <NavLink
            to="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-mono text-slate-600 hover:text-cyan-400 flex items-center justify-between"
          >
            <span>Cart</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black font-bold text-xs">
              {totalItems} items
            </span>
          </NavLink>
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-mono text-cyan-400 font-bold"
            >
              Sign In / Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
