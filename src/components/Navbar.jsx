import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ShoppingCart, Heart, LogOut, Menu, X, User, Package, ChevronDown, Sun, Moon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useTheme } from "../context/ThemeContext";
import useClickOutside from "../hooks/useClickOutside";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate("/products");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-overlay/8 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent2-500 shadow-lg shadow-accent-500/20">
            <ShoppingBag size={18} className="text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-base-100">
            Shop<span className="text-gradient">ly</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-base-300 transition hover:bg-overlay/5 hover:text-base-100">
            Products
          </Link>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/wishlist"
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
          >
            <Heart size={18} />
            {totalWishlistItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                {totalWishlistItems}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
          >
            <ShoppingCart size={18} />
            Cart
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-overlay/8 bg-overlay/5 py-1.5 pl-1.5 pr-2.5 transition hover:border-overlay/15"
              >
                <span className="relative">
                  <UserAvatar name={user.fullName} size={28} />
                  {!user.emailVerified && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-base-900 bg-amber-400" />
                  )}
                </span>
                <span className="text-sm font-medium text-base-100">{user.fullName.split(" ")[0]}</span>
                <ChevronDown size={14} className={`text-base-400 transition ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="glass absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-overlay/10 py-1.5 shadow-xl"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
                    >
                      <Package size={15} /> Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-base-300 transition hover:bg-overlay/5 hover:text-base-100">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:opacity-90"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-base-300 sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-overlay/8 px-4 py-3 sm:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-base-300 hover:bg-overlay/5">
              Products
            </Link>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-base-300 hover:bg-overlay/5"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-base-300 hover:bg-overlay/5"
            >
              <span className="flex items-center gap-2">
                <Heart size={18} /> Wishlist
              </span>
              {totalWishlistItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-base-300 hover:bg-overlay/5"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} /> Cart
              </span>
              {totalItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-300 hover:bg-overlay/5">
                  <User size={16} /> Profile
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-300 hover:bg-overlay/5">
                  <Package size={16} /> Orders
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-overlay/5">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="mt-1 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg border border-overlay/10 px-3 py-2 text-center text-sm font-medium text-base-100">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
