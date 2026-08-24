import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, PROMO_CODES, CATEGORIES, BRANDS } from '../types/products';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Products Dataset
  const [products] = useState(PRODUCTS);

  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Cart State with LocalStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : ['aura-pro-headphones', 'vortex-cyberphone-pro'];
    } catch {
      return ['aura-pro-headphones', 'vortex-cyberphone-pro'];
    }
  });

  // Compare List (max 4 products)
  const [compareList, setCompareList] = useState([]);

  // Drawers & Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [arProduct, setARProduct] = useState(null);

  // Selected Product for 3D Detail View
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeSize, setActiveSize] = useState(null);

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Promo Code
  const [appliedPromo, setAppliedPromo] = useState(null);

  // View Mode: 'grid' | 'spatial-carousel' | 'split-cinema'
  const [viewMode, setViewMode] = useState('grid');

  // Filter & Search State
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    searchQuery: '',
    minPrice: 0,
    maxPrice: 1500,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'popularity', // 'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('aura_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('aura_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Add toast notification
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Auth Functions
  const login = (email, password) => {
    sound.playCartSuccess();
    const newUser = {
      name: email.split('@')[0] || 'Cyber Explorer',
      email: email,
      role: 'Hardware VIP Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: 'August 2026',
      orders: [
        {
          id: 'ORD-9842',
          date: 'Aug 20, 2026',
          productName: 'Aura Pro Spatial ANC Headphones',
          total: 399,
          status: 'Shipped (Tracking Live)',
        },
      ],
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    confetti({ particleCount: 50, spread: 50 });
    addToast(`Welcome back, ${newUser.name}!`, 'success');
  };

  const signup = (name, email, password) => {
    sound.playCartSuccess();
    const newUser = {
      name: name || 'Aura Member',
      email: email,
      role: 'Early Access Member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: 'August 2026',
      orders: [],
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    confetti({ particleCount: 70, spread: 70 });
    addToast(`Account created! Welcome, ${newUser.name}.`, 'success');
  };

  const logout = () => {
    sound.playClick();
    setUser(null);
    setIsProfileDrawerOpen(false);
    addToast('Logged out successfully', 'info');
  };

  // Cart operations
  const addToCart = (product, color = null, material = null, size = null, quantity = 1) => {
    sound.playCartSuccess();
    const chosenColor = color || product.colors[0];
    const chosenMat = material || (product.materials ? product.materials[0] : null);
    const chosenSize = size || (product.sizes ? product.sizes[0] : null);
    const cartItemId = `${product.id}-${chosenColor.id}-${chosenMat ? chosenMat.id : 'default'}-${chosenSize || 'std'}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          product,
          color: chosenColor,
          material: chosenMat,
          size: chosenSize,
          quantity,
          addedAt: Date.now(),
        },
      ];
    });

    addToast(`Added ${product.name} to Cart`, 'success');
  };

  // Buy Now: adds to cart and opens cart drawer immediately
  const buyNow = (product, color = null, material = null, size = null, quantity = 1) => {
    addToCart(product, color, material, size, quantity);
    setIsCartOpen(true);
    if (selectedProduct) {
      setSelectedProduct(null);
    }
  };

  const removeFromCart = (cartItemId) => {
    sound.playClick();
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    addToast('Removed item from Cart', 'info');
  };

  const updateCartQuantity = (cartItemId, newQty) => {
    sound.playClick();
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  // Wishlist toggle
  const toggleWishlist = (productId) => {
    sound.playClick();
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Saved to Wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  // Compare toggle
  const toggleCompare = (product) => {
    sound.playClick();
    setCompareList(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        addToast(`Removed ${product.name} from comparison`, 'info');
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        addToast('Comparison limit reached (Max 4 products)', 'warning');
        return prev;
      }
      addToast(`Added ${product.name} to comparison`, 'success');
      return [...prev, product];
    });
  };

  // Open 3D Detail Modal
  const openProductDetail = (product, color = null, size = null) => {
    sound.playClick();
    setSelectedProduct(product);
    setActiveColor(color || product.colors[0]);
    setActiveMaterial(product.materials ? product.materials[0] : null);
    setActiveSize(size || (product.sizes ? product.sizes[0] : null));
  };

  const closeProductDetail = () => {
    sound.playClick();
    setSelectedProduct(null);
  };

  // Open AR Simulator Modal
  const openARSimulator = (product) => {
    sound.playClick();
    setARProduct(product);
    setIsAROpen(true);
  };

  // Apply Promo code
  const applyPromoCode = (code) => {
    sound.playClick();
    const cleanCode = code.trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      setAppliedPromo({ code: cleanCode, ...PROMO_CODES[cleanCode] });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      addToast(`Promo code ${cleanCode} applied successfully!`, 'success');
      return true;
    } else {
      addToast('Invalid promo code. Try AURA20 or CYBER3D', 'warning');
      return false;
    }
  };

  // Computed Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = (cartSubtotal * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountAmount) {
      discountAmount = Math.min(cartSubtotal, appliedPromo.discountAmount);
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filtered & Sorted Products
  const filteredProducts = products.filter(p => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.brand !== 'all' && p.brand !== filters.brand) return false;
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (p.rating < filters.minRating) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchTag = p.tagline.toLowerCase().includes(q);
      const matchDesc = p.shortDesc.toLowerCase().includes(q);
      const matchBrand = (p.brandName || '').toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchDesc && !matchBrand) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.releaseYear || 2026) - (a.releaseYear || 2026);
      case 'popularity':
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  return (
    <StoreContext.Provider
      value={{
        products,
        filteredProducts,
        user,
        isAuthModalOpen,
        authMode,
        isProfileDrawerOpen,
        cart,
        cartItemsCount,
        cartSubtotal,
        discountAmount,
        cartTotal,
        appliedPromo,
        wishlist,
        compareList,
        isCartOpen,
        isWishlistOpen,
        isCompareOpen,
        isAROpen,
        arProduct,
        selectedProduct,
        activeColor,
        activeMaterial,
        activeSize,
        soundEnabled,
        viewMode,
        filters,
        toasts,
        setIsAuthModalOpen,
        setAuthMode,
        setIsProfileDrawerOpen,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsCompareOpen,
        setIsAROpen,
        setSoundEnabled,
        setViewMode,
        setFilters,
        setActiveColor,
        setActiveMaterial,
        setActiveSize,
        login,
        signup,
        logout,
        addToCart,
        buyNow,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        toggleCompare,
        openProductDetail,
        closeProductDetail,
        openARSimulator,
        applyPromoCode,
        addToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
