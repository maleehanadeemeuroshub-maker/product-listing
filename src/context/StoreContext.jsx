import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, PROMO_CODES, CATEGORIES, BRANDS } from '../types/products';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { supabase } from '../services/supabaseClient';

const StoreContext = createContext(null);

// Maps a Supabase auth user onto the display shape the UI expects.
function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    name: meta.name || supabaseUser.email?.split('@')[0] || 'Aura Member',
    email: supabaseUser.email,
    avatar: meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Aura Member',
    joinedDate: new Date(supabaseUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

export function StoreProvider({ children }) {
  // Products Dataset
  const [products] = useState(PRODUCTS);

  // User Authentication State — backed by real Supabase Auth (see effect below).
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Cart State with LocalStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Promo Code
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Wishlist & Compare — persisted per-user in Supabase (see effects below).
  // Both store raw product ids; compareList is hydrated to full product
  // objects below since existing consumers expect that shape.
  const [wishlist, setWishlist] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

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

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Track the real Supabase auth session, and react to a password-recovery
  // link being opened (Supabase fires this event when the URL carries a
  // recovery token, regardless of path — no dedicated route needed).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user));
      setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(mapSupabaseUser(session?.user));
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetPasswordOpen(true);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Load this user's saved wishlist/compare lists whenever auth state changes.
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setCompareIds([]);
      return;
    }
    supabase
      .from('user_product_lists')
      .select('product_id, list_type')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load saved lists', error);
          return;
        }
        setWishlist(data.filter((r) => r.list_type === 'wishlist').map((r) => r.product_id));
        setCompareIds(data.filter((r) => r.list_type === 'compare').map((r) => r.product_id));
      });
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

  // Auth Functions — all backed by real Supabase Auth.
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      addToast(error.message, 'warning');
      return;
    }
    sound.playCartSuccess();
    setIsAuthModalOpen(false);
    confetti({ particleCount: 50, spread: 50 });
    addToast(`Welcome back, ${mapSupabaseUser(data.user).name}!`, 'success');
  };

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      addToast(error.message, 'warning');
      return;
    }
    sound.playCartSuccess();
    setIsAuthModalOpen(false);
    confetti({ particleCount: 70, spread: 70 });
    if (!data.session) {
      addToast('Check your email to confirm your account.', 'info');
    } else {
      addToast(`Account created! Welcome, ${mapSupabaseUser(data.user).name}.`, 'success');
    }
  };

  const logout = async () => {
    sound.playClick();
    await supabase.auth.signOut();
    setIsProfileDrawerOpen(false);
    addToast('Logged out successfully', 'info');
  };

  const requestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      addToast(error.message, 'warning');
      return false;
    }
    addToast(`Password recovery link sent to ${email}`, 'success');
    return true;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      addToast(error.message, 'warning');
      return false;
    }
    setIsResetPasswordOpen(false);
    addToast('Password updated. You are signed in.', 'success');
    return true;
  };

  const updateAvatar = async (file) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file);
    if (uploadError) {
      addToast(uploadError.message, 'warning');
      return;
    }
    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl.publicUrl },
    });
    if (updateError) {
      addToast(updateError.message, 'warning');
      return;
    }
    setUser((prev) => ({ ...prev, avatar: publicUrl.publicUrl }));
    addToast('Avatar updated', 'success');
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

  const compareList = products.filter((p) => compareIds.includes(p.id));

  // Wishlist toggle — persisted to Supabase, requires sign-in.
  const toggleWishlist = async (productId) => {
    if (!user) {
      addToast('Sign in to save items to your Wishlist', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    sound.playClick();
    const exists = wishlist.includes(productId);
    if (exists) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      const { error } = await supabase
        .from('user_product_lists')
        .delete()
        .match({ user_id: user.id, product_id: productId, list_type: 'wishlist' });
      if (error) addToast(error.message, 'warning');
      else addToast('Removed from Wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, productId]);
      const { error } = await supabase
        .from('user_product_lists')
        .insert({ user_id: user.id, product_id: productId, list_type: 'wishlist' });
      if (error) addToast(error.message, 'warning');
      else addToast('Saved to Wishlist', 'success');
    }
  };

  // Compare toggle — persisted to Supabase, requires sign-in.
  const toggleCompare = async (product) => {
    if (!user) {
      addToast('Sign in to compare products', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    sound.playClick();
    const exists = compareIds.includes(product.id);
    if (exists) {
      setCompareIds((prev) => prev.filter((id) => id !== product.id));
      const { error } = await supabase
        .from('user_product_lists')
        .delete()
        .match({ user_id: user.id, product_id: product.id, list_type: 'compare' });
      if (error) addToast(error.message, 'warning');
      else addToast(`Removed ${product.name} from comparison`, 'info');
      return;
    }
    if (compareIds.length >= 4) {
      addToast('Comparison limit reached (Max 4 products)', 'warning');
      return;
    }
    setCompareIds((prev) => [...prev, product.id]);
    const { error } = await supabase
      .from('user_product_lists')
      .insert({ user_id: user.id, product_id: product.id, list_type: 'compare' });
    if (error) addToast(error.message, 'warning');
    else addToast(`Added ${product.name} to comparison`, 'success');
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
        authLoading,
        isAuthModalOpen,
        authMode,
        isProfileDrawerOpen,
        isResetPasswordOpen,
        setIsResetPasswordOpen,
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
        requestPasswordReset,
        updatePassword,
        updateAvatar,
        addToCart,
        buyNow,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyPromoCode,
        toggleWishlist,
        toggleCompare,
        openProductDetail,
        closeProductDetail,
        openARSimulator,
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
