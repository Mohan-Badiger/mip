"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// const DEFAULT_USER_PROFILE = {
//   name: 'Mohan Badiger',
//   email: 'mohan@badiger.com',
//   phone: '+91 94481 29285',
//   address: 'Mangalwar Peth, Near Vitthal Mandir, Banahatti, Karnataka',
//   pincode: '587311'
// };


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirectTab, setAuthModalRedirectTab] = useState(null);

  // Load session from backend me API on mount
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function checkSession() {
      let isUserLoggedIn = false;
      const isLoggedInHint = localStorage.getItem('mip_is_logged_in') === 'true';
      if (isLoggedInHint) {
        try {
          const res = await fetch('/api/v1/auth/me', { signal: controller.signal });
          if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error('Not JSON');
          const data = await res.json();
          if (active && data.success && data.user) {
            setUser(data.user);
            isUserLoggedIn = true;
          } else if (active) {
            setUser(null);
            localStorage.setItem('mip_is_logged_in', 'false');
          }
        } catch (err) {
          if (err.name !== 'AbortError' && active) {
            setUser(null);
          }
        }
      } else if (active) {
        setUser(null);
      }
      
      if (!active) return;
      const storedOrders = localStorage.getItem('mip_user_orders');
      const storedWishlist = localStorage.getItem('mip_user_wishlist');
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
      setIsMounted(true);

      // Fetch fresh orders from db if user session exists
      if (isUserLoggedIn) {
        try {
          const ordersRes = await fetch('/api/v1/orders', { signal: controller.signal });
          const ordersData = await ordersRes.json();
          if (active && ordersData.success && ordersData.orders) {
            setOrders(ordersData.orders);
            localStorage.setItem('mip_user_orders', JSON.stringify(ordersData.orders));
          }
        } catch (err) {
          if (err.name !== 'AbortError' && active) {
            console.error('Failed to sync DB orders on session load:', err);
          }
        }
      }
    }
    checkSession();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (isMounted) {
      if (user) {
        localStorage.setItem('mip_is_logged_in', 'true');
        localStorage.setItem('mip_user_profile', JSON.stringify(user));
      } else {
        localStorage.setItem('mip_is_logged_in', 'false');
        localStorage.removeItem('mip_user_profile');
      }
    }
  }, [user, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('mip_user_orders', JSON.stringify(orders));
    }
  }, [orders, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('mip_user_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // Clear any previous session leftovers first
        setOrders([]);
        setWishlist([]);
        localStorage.removeItem('mip_user_orders');
        localStorage.removeItem('mip_user_wishlist');
        setUser(data.user);
        // Fetch database orders on login
        try {
          const ordersRes = await fetch('/api/v1/orders');
          const ordersData = await ordersRes.json();
          if (ordersData.success && ordersData.orders) {
            setOrders(ordersData.orders);
            localStorage.setItem('mip_user_orders', JSON.stringify(ordersData.orders));
          }
        } catch (err) {
          console.error('Failed to sync orders on login:', err);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      // Reset state and clear session localStorage
      setOrders([]);
      setWishlist([]);
      localStorage.removeItem('mip_user_orders');
      localStorage.removeItem('mip_user_wishlist');
      localStorage.setItem('mip_is_logged_in', 'false');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback clean state
      setOrders([]);
      setWishlist([]);
      localStorage.removeItem('mip_user_orders');
      localStorage.removeItem('mip_user_wishlist');
      localStorage.setItem('mip_is_logged_in', 'false');
      setUser(null);
    }
  };

  const updateProfile = async (updatedDetails) => {
    try {
      // Parse address string into structured fields for the API
      let primaryAddress = updatedDetails.primaryAddress || null;
      if (!primaryAddress && updatedDetails.address && updatedDetails.pincode) {
        const addressParts = updatedDetails.address.split(',');
        const state = addressParts[addressParts.length - 1]?.trim() || '';
        const city = addressParts[addressParts.length - 2]?.trim() || '';
        const street = addressParts.slice(0, addressParts.length - 2).join(',').trim() || updatedDetails.address;
        primaryAddress = { street, city, state, pincode: updatedDetails.pincode };
      }

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedDetails.name,
          phone: updatedDetails.phone,
          primaryAddress
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const fetchOrders = async () => {
    const isLoggedInHint = localStorage.getItem('mip_is_logged_in') === 'true';
    if (!isLoggedInHint) return;
    try {
      const res = await fetch('/api/v1/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        localStorage.setItem('mip_user_orders', JSON.stringify(data.orders));
      }
    } catch (err) {
      console.error('Failed to manually sync orders from DB:', err);
    }
  };

  const addOrder = (newOrder) => {
    const orderWithDate = {
      ...newOrder,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setOrders((prev) => [orderWithDate, ...prev]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const openAuthModal = (redirectTab = null) => {
    setIsAuthModalOpen(true);
    setAuthModalRedirectTab(redirectTab);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalRedirectTab(null);
  };

  const register = async (name, email, phone, password, pincode) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, pincode })
      });
      const data = await res.json();
      if (data.success) {
        // Clear any previous session leftovers first
        setOrders([]);
        setWishlist([]);
        localStorage.removeItem('mip_user_orders');
        localStorage.removeItem('mip_user_wishlist');
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const sendOtp = async (email, type, payload = null) => {
    try {
      const reqBody = { email, type };
      if (payload) {
        reqBody.payload = payload;
      }
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  const verifyOtp = async (email, otp, type) => {
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type })
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Clear any previous session leftovers first
        setOrders([]);
        setWishlist([]);
        localStorage.removeItem('mip_user_orders');
        localStorage.removeItem('mip_user_wishlist');
        setUser(data.user);
        // Fetch new orders
        try {
          const ordersRes = await fetch('/api/v1/orders');
          const ordersData = await ordersRes.json();
          if (ordersData.success && ordersData.orders) {
            setOrders(ordersData.orders);
            localStorage.setItem('mip_user_orders', JSON.stringify(ordersData.orders));
          }
        } catch (err) {
          console.error('Failed to sync orders on OTP login:', err);
        }
      }
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  const resetPassword = async (email, token, password) => {
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setOrders([]);
        setWishlist([]);
        localStorage.removeItem('mip_user_orders');
        localStorage.removeItem('mip_user_wishlist');
        localStorage.setItem('mip_is_logged_in', 'false');
        setUser(null);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to delete account' };
      }
    } catch (err) {
      console.error('Delete account error:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        orders,
        wishlist,
        isMounted,
        login,
        logout,
        updateProfile,
        addOrder,
        fetchOrders,
        toggleWishlist,
        isWishlisted,
        isAuthModalOpen,
        authModalRedirectTab,
        openAuthModal,
        closeAuthModal,
        register,
        sendOtp,
        verifyOtp,
        resetPassword,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
