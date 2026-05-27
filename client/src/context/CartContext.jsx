"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const { isLoggedIn, isMounted: authMounted } = useAuth();

  // Mapping helper to map database cart items to the client structure
  const mapBackendCartItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const p = item.product;
      if (!p) return null;
      return {
        product: {
          id: p._id,
          slug: p.slug,
          name: p.name,
          image: p.images && p.images[0] ? p.images[0] : '/images/placeholder.png',
          price: p.pricing?.finalPrice || p.price,
          weight: p.metalWeight ? p.metalWeight + 'g' : '—',
          metal: p.metalPurity && p.metalType ? `${p.metalPurity} ${p.metalType.toUpperCase()}` : '—',
          stone: p.gemstones && p.gemstones[0] ? (p.gemstones[0].type.charAt(0).toUpperCase() + p.gemstones[0].type.slice(1)) : null,
          tag: p.tag || null
        },
        quantity: item.quantity
      };
    }).filter(Boolean);
  };

  // 1. Initial Load: load from backend if logged in, otherwise from localStorage
  useEffect(() => {
    async function loadInitialCart() {
      if (authMounted) {
        if (isLoggedIn) {
          try {
            const res = await fetch('/api/v1/cart');
            if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error('Not JSON');
            const data = await res.json();
            if (data.success && data.cart && Array.isArray(data.cart.items)) {
              setCartItems(mapBackendCartItems(data.cart.items));
            }
          } catch (e) {
            console.error('Failed to load cart from backend:', e);
          }
        } else {
          const savedCart = localStorage.getItem('mip_cart');
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (e) {
              console.error('Failed to parse cart items from localStorage:', e);
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }
        setIsMounted(true);
      }
    }
    loadInitialCart();
  }, [isLoggedIn, authMounted]);

  // 2. Sync guest cart items to backend upon login
  useEffect(() => {
    if (isMounted && isLoggedIn && cartItems.length > 0) {
      async function syncCartOnLogin() {
        try {
          const formattedItems = cartItems.map(item => ({
            product: item.product.id || item.product._id,
            quantity: item.quantity
          }));
          await fetch('/api/v1/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: formattedItems })
          });
          // Fetch updated cart from backend to resolve prices/names
          const res = await fetch('/api/v1/cart');
          const data = await res.json();
          if (data.success && data.cart && Array.isArray(data.cart.items)) {
            setCartItems(mapBackendCartItems(data.cart.items));
          }
        } catch (e) {
          console.error('Failed to sync cart on login:', e);
        }
      }
      syncCartOnLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // 3. Save to localStorage when cart changes (fallback for guest users)
  useEffect(() => {
    if (isMounted && !isLoggedIn) {
      localStorage.setItem('mip_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted, isLoggedIn]);

  const addToCart = async (product, quantity = 1) => {
    let updatedItems = [];
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        updatedItems = prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...prevItems, { product, quantity }];
      }
      return updatedItems;
    });

    if (isLoggedIn) {
      try {
        const existingItem = cartItems.find((item) => item.product.id === product.id);
        const newQty = existingItem ? existingItem.quantity + quantity : quantity;
        await fetch('/api/v1/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id || product._id, quantity: newQty })
        });
      } catch (err) {
        console.error('Failed to update cart item in backend:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));

    if (isLoggedIn) {
      try {
        await fetch(`/api/v1/cart?productId=${productId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to remove cart item from backend:', err);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    if (isLoggedIn) {
      try {
        await fetch('/api/v1/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
      } catch (err) {
        console.error('Failed to update cart quantity in backend:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isLoggedIn) {
      try {
        await fetch('/api/v1/cart', {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Failed to clear cart in backend:', err);
      }
    } else {
      localStorage.removeItem('mip_cart');
    }
  };

  // Derive counts
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isMounted,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
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
