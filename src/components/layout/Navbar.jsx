import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  ShoppingBag,
  Heart,
  Scale,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  User,
  X,
  Layers,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    cartItemsCount,
    wishlist,
    compareList,
    filters,
    setFilters,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsCompareOpen,
    setIsAuthModalOpen,
    setAuthMode,
    setIsProfileDrawerOpen,
    soundEnabled,
    setSoundEnabled,
  } = useStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;
        const scrolledDown = currentScrollY > lastScrollY;
        const pastThreshold = currentScrollY > 96;

        setIsHeaderHidden(scrolledDown && pastThreshold);

        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    sound.playClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full glass-panel border-b border-slate-900/10 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-6 min-w-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2 sm:gap-2.5 min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-bold tracking-tight font-['Space_Grotesk'] text-slate-900 flex items-center gap-1 whitespace-nowrap">
                AURA<span className="text-cyan-400">3D</span>
              </span>
              <span className="hidden sm:block text-[10px] font-mono tracking-widest text-slate-500 uppercase -mt-1">
                Spatial Showcase
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-600 hover:text-cyan-400 transition-colors"
            >
              Home
            </a>
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('catalog');
              }}
              className="text-slate-600 hover:text-cyan-400 transition-colors"
            >
              Products
            </a>
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('catalog');
              }}
              className="text-slate-600 hover:text-cyan-400 transition-colors"
            >
              Categories
            </a>
          </nav>
        </div>

        {/* Global Live Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div
            className={`relative rounded-xl transition-all duration-300 ${
              isSearchFocused
                ? 'ring-2 ring-cyan-500/50 bg-white/90 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-50/80 hover:bg-white/80 border border-slate-900/10'
            }`}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search 3D headphones, watches, phones, drones..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => {
                sound.playHover();
                setIsSearchFocused(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-transparent text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/5 text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              sound.playClick();
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2.5 rounded-xl transition-all border bg-slate-50/80 border-slate-900/10 text-slate-500 hover:text-slate-600"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              sound.playClick();
            }}
            title={soundEnabled ? 'Mute UI Sounds' : 'Unmute UI Sounds'}
            className={`hidden sm:inline-flex p-1.5 sm:p-2.5 rounded-xl transition-all border ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-slate-50/80 border-slate-900/10 text-slate-500 hover:text-slate-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Compare Button */}
          {compareList.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                setIsCompareOpen(true);
              }}
              className="relative p-1.5 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline text-xs font-mono font-medium">Compare</span>
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold text-[10px] flex items-center justify-center">
                {compareList.length}
              </span>
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsWishlistOpen(true);
            }}
            title="Open Wishlist"
            className="relative p-1.5 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-900/10 text-slate-600 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-400 fill-rose-400/20' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-slate-900 font-bold text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <button
              onClick={() => {
                sound.playClick();
                setIsProfileDrawerOpen(true);
              }}
              className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-2xl glass-panel border border-cyan-500/40 hover:bg-white/5 transition-all"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-xl object-cover border border-cyan-400/50"
              />
              <span className="text-xs font-mono font-bold text-slate-900 hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl glass-panel border border-slate-900/12 text-slate-700 hover:text-slate-900 hover:border-cyan-500/40 text-xs font-mono font-bold transition-all"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsCartOpen(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">Cart</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-xs font-mono font-bold">
              {cartItemsCount}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative rounded-xl bg-white/70 border border-slate-900/10">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search 3D catalog..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
