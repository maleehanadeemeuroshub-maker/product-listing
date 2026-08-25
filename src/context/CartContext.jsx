import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const CartContext = createContext(null);

const PROMO_CODES = {
  'WEEK7': { code: 'WEEK7', discountPercent: 15, desc: '15% Off Week 7 Special' },
  'DUMMYJSON': { code: 'DUMMYJSON', discountPercent: 20, desc: '20% Off Developer Special' },
  'SAVE10': { code: 'SAVE10', discountAmount: 10, desc: '$10 Off Flat Discount' },
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shoply_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('shoply_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart with LocalStorage', e);
    }
  }, [cart]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * Add a product to cart. If it already exists, increment quantity.
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;
    const qty = Math.max(1, Number(quantity) || 1);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        // Increment quantity of existing product
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }

      // Add new product item
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          category: product.category,
          brand: product.brand || 'Generic',
          stock: product.stock,
          discountPercentage: product.discountPercentage,
          quantity: qty,
        },
      ];
    });

    showToast(`Added "${product.title}" to cart!`);
  };

  /**
   * Remove item completely from cart
   */
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  /**
   * Increase quantity by 1
   */
  const increaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Decrease quantity by 1. If 0, remove.
   */
  const decreaseQuantity = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /**
   * Clear all items in cart
   */
  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  /**
   * Apply promotional discount code
   */
  const applyPromoCode = (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    const clean = code.trim().toUpperCase();

    if (PROMO_CODES[clean]) {
      setAppliedPromo(PROMO_CODES[clean]);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
      showToast(`Coupon ${clean} applied successfully!`);
      return { success: true, message: 'Coupon applied!' };
    }

    return { success: false, message: 'Invalid promo code. Try WEEK7 or SAVE10' };
  };

  // Calculations
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = (subtotalPrice * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountAmount) {
      discountAmount = Math.min(subtotalPrice, appliedPromo.discountAmount);
    }
  }

  const freeShippingThreshold = 100;
  const isFreeShipping = subtotalPrice >= freeShippingThreshold;
  const shippingFee = subtotalPrice > 0 && !isFreeShipping ? 9.99 : 0;
  const totalPrice = Math.max(0, subtotalPrice - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        subtotalPrice,
        discountAmount,
        shippingFee,
        isFreeShipping,
        freeShippingThreshold,
        totalPrice,
        appliedPromo,
        toastMessage,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        applyPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
