import React from 'react';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/showcase/HeroSection';
import FilterSidebar from './components/showcase/FilterSidebar';
import ProductGrid from './components/showcase/ProductGrid';
import Footer from './components/layout/Footer';
import CartDrawer from './components/drawers/CartDrawer';
import WishlistDrawer from './components/drawers/WishlistDrawer';
import CompareDrawer from './components/drawers/CompareDrawer';
import UserProfileDrawer from './components/drawers/UserProfileDrawer';
import ProductDetailModal from './components/modals/ProductDetailModal';
import ARSimulatorModal from './components/modals/ARSimulatorModal';
import AuthModal from './components/modals/AuthModal';
import ToastContainer from './components/common/ToastContainer';
import { Sparkles, Layers, Box, Cpu } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar />

      {/* Cinematic 3D Hero Section */}
      <HeroSection />

      {/* Main Catalog Showcase Section */}
      <main id="catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-900/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Full Interactive 3D Hardware Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Space_Grotesk'] text-slate-900">
              Explore Spatial Hardware
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              60 FPS WebGL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Exploded Teardowns
            </span>
          </div>
        </div>

        {/* Catalog Main Layout: Filter Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar />
          <ProductGrid />
        </div>

      </main>

      {/* Modals & Slide-over Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <CompareDrawer />
      <UserProfileDrawer />
      <ProductDetailModal />
      <ARSimulatorModal />
      <AuthModal />
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
