import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, BRANDS } from '../types/products';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  getProductsByHandles,
  shopifyGetCart,
  shopifyCreateCart,
  shopifyAddLine,
  shopifyUpdateLine,
  shopifyRemoveLines,
} from '../services/shopify';
import { supabase } from '../services/supabaseClient';

const StoreContext = createContext(null);

const CART_ID_KEY = 'aura_shopify_cart_id';

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

// Merges Shopify's live commerce fields (price, stock, variant ids) onto our
// local 3D/presentational product data (colors, materials, exploded layers).
// A product with no matching Shopify data (not imported yet) is returned
// unchanged and simply can't be added to a real cart until it is.
function mergeShopifyProduct(product, shopifyProduct) {
  if (!shopifyProduct) return product;

  const shopifyVariantsBySize = {};
  for (const variant of shopifyProduct.variants.nodes) {
    const sizeOption = variant.selectedOptions.find((o) => o.name === 'Edition');
    const key = sizeOption ? sizeOption.value : variant.title;
    shopifyVariantsBySize[key] = {
      variantId: variant.id,
      price: parseFloat(variant.price.amount),
      compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice.amount) : null,
      availableForSale: variant.availableForSale,
    };
  }

  const firstVariant = shopifyProduct.variants.nodes[0];

  return {
    ...product,
    price: parseFloat(shopifyProduct.priceRange.minVariantPrice.amount),
    originalPrice: shopifyProduct.compareAtPriceRange?.minVariantPrice
      ? parseFloat(shopifyProduct.compareAtPriceRange.minVariantPrice.amount)
      : product.originalPrice,
    inStock: shopifyProduct.availableForSale,
    shopifyProductId: shopifyProduct.id,
    shopifyVariantsBySize,
    defaultVariantId: firstVariant?.id || null,
  };
}

// Rebuilds the UI-shaped cart line list (with our local product/color/material
// data for the 3D thumbnails) from Shopify's cart response, which only knows
// about products/variants/line-attributes.
function deriveCartLines(shopifyCart, products) {
  if (!shopifyCart) return [];
  return shopifyCart.lines.nodes.map((line) => {
    const product = products.find((p) => p.id === line.merchandise.product.handle) || null;
    const attrs = Object.fromEntries((line.attributes || []).map((a) => [a.key, a.value]));
    const color =
      (product?.colors || []).find((c) => c.name === attrs.Color) || product?.colors?.[0] || null;
    const material =
      (product?.materials || []).find((m) => m.name === attrs.Material) || null;

    return {
      cartItemId: line.id,
      product: product || {
        id: line.merchandise.product.handle,
        name: line.merchandise.product.title,
        price: parseFloat(line.merchandise.price.amount),
      },
      color: color || { id: 'default', name: 'Default', hex: '#94a3b8' },
      material,
      size: line.merchandise.title,
      quantity: line.quantity,
      lineTotal: parseFloat(line.cost.totalAmount.amount),
    };
  });
}

export function StoreProvider({ children }) {
  // Products Dataset — starts as local mock data, gets live Shopify
  // price/stock/variant data merged in once it loads (see effect below).
  const [products, setProducts] = useState(PRODUCTS);

  // User Authentication State — backed by real Supabase Auth (see effect below).
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Cart is backed by a real Shopify cart (see services/shopify.js). We keep
  // the raw Shopify cart plus a UI-shaped derived line list.
  const [shopifyCart, setShopifyCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

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

  // Load live Shopify data (price/stock/variants) for every local product,
  // once, on mount. Products without a matching Shopify handle are left as-is.
  useEffect(() => {
    let cancelled = false;
    getProductsByHandles(PRODUCTS.map((p) => p.id)).then((byHandle) => {
      if (cancelled) return;
      setProducts(PRODUCTS.map((p) => mergeShopifyProduct(p, byHandle[p.id])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resume an existing Shopify cart from localStorage, if any.
  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (!savedCartId) return;
    shopifyGetCart(savedCartId)
      .then((c) => {
        if (c) setShopifyCart(c);
        else localStorage.removeItem(CART_ID_KEY);
      })
      .catch((err) => console.error('Failed to resume cart', err));
  }, []);

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

  // Cart operations — all backed by a real Shopify cart.
  const addToCart = async (product, color = null, material = null, size = null, quantity = 1) => {
    const chosenColor = color || product.colors[0];
    const chosenMat = material || (product.materials ? product.materials[0] : null);
    const chosenSize = size || (product.sizes ? product.sizes[0] : null);
    const variant = product.shopifyVariantsBySize?.[chosenSize];

    if (!variant) {
      addToast(`${product.name} isn't available for purchase yet (catalog sync pending)`, 'warning');
      return;
    }

    sound.playCartSuccess();
    setCartLoading(true);
    try {
      const lines = [
        {
          merchandiseId: variant.variantId,
          quantity,
          attributes: [
            { key: 'Color', value: chosenColor.name },
            ...(chosenMat ? [{ key: 'Material', value: chosenMat.name }] : []),
          ],
        },
      ];

      let updatedCart;
      if (shopifyCart) {
        updatedCart = await shopifyAddLine(shopifyCart.id, lines);
      } else {
        updatedCart = await shopifyCreateCart(lines);
        localStorage.setItem(CART_ID_KEY, updatedCart.id);
      }
      setShopifyCart(updatedCart);
      addToast(`Added ${product.name} to Cart`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not add item to cart. Please try again.', 'warning');
    } finally {
      setCartLoading(false);
    }
  };

  // Buy Now: adds to cart and opens cart drawer immediately
  const buyNow = async (product, color = null, material = null, size = null, quantity = 1) => {
    await addToCart(product, color, material, size, quantity);
    setIsCartOpen(true);
    if (selectedProduct) {
      setSelectedProduct(null);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!shopifyCart) return;
    sound.playClick();
    setCartLoading(true);
    try {
      const updatedCart = await shopifyRemoveLines(shopifyCart.id, [cartItemId]);
      setShopifyCart(updatedCart);
      addToast('Removed item from Cart', 'info');
    } catch (err) {
      console.error(err);
      addToast('Could not remove item. Please try again.', 'warning');
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartQuantity = async (cartItemId, newQty) => {
    if (!shopifyCart) return;
    sound.playClick();
    if (newQty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    setCartLoading(true);
    try {
      const updatedCart = await shopifyUpdateLine(shopifyCart.id, [{ id: cartItemId, quantity: newQty }]);
      setShopifyCart(updatedCart);
    } catch (err) {
      console.error(err);
      addToast('Could not update quantity. Please try again.', 'warning');
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = () => {
    setShopifyCart(null);
    localStorage.removeItem(CART_ID_KEY);
  };

  const cart = deriveCartLines(shopifyCart, products);
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

  // Computed Cart Totals — read straight from Shopify's cart (it owns tax/
  // discount/shipping math for real). Discount codes are entered on Shopify's
  // own checkout page now, not here.
  const cartSubtotal = shopifyCart ? parseFloat(shopifyCart.cost.subtotalAmount.amount) : 0;
  const cartTotal = shopifyCart ? parseFloat(shopifyCart.cost.totalAmount.amount) : 0;
  const cartItemsCount = shopifyCart ? shopifyCart.totalQuantity : 0;

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
        cartLoading,
        cartItemsCount,
        cartSubtotal,
        cartTotal,
        checkoutUrl: shopifyCart?.checkoutUrl || null,
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
