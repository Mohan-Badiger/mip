"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

const DEFAULT_USER_PROFILE = {
  name: 'Mohan Badiger',
  email: 'mohan@badiger.com',
  phone: '+91 94481 29285',
  address: 'Mangalwar Peth, Near Vitthal Mandir, Banahatti, Karnataka',
  pincode: '587311'
};

const DEFAULT_ORDERS = [
  {
    id: 'MIP-ORD-581924',
    date: '2026-05-10',
    items: [
      {
        id: 'e1',
        name: 'Lotus Diamond Drops',
        price: 28500,
        quantity: 1,
        weight: '3.2g',
        metal: '18KT Gold',
        image: '/images/product_earrings_1.png'
      }
    ],
    subtotal: 28500,
    discount: 2850,
    total: 25650,
    status: 'Delivered',
    paymentMethod: 'card'
  },
  {
    id: 'MIP-ORD-472091',
    date: '2026-04-18',
    items: [
      {
        id: 'r3',
        name: 'Plain Band Ring',
        price: 14200,
        quantity: 2,
        weight: '3.8g',
        metal: '22KT Gold',
        image: '/images/modern_diamonds_1779199687171.png'
      }
    ],
    subtotal: 28400,
    discount: 0,
    total: 28400,
    status: 'Delivered',
    paymentMethod: 'cod'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirectTab, setAuthModalRedirectTab] = useState(null);

  // Load from local storage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const storedLogin = localStorage.getItem('mip_is_logged_in');
      const storedUser = localStorage.getItem('mip_user_profile');
      const storedOrders = localStorage.getItem('mip_user_orders');
      const storedWishlist = localStorage.getItem('mip_user_wishlist');

      if (storedLogin === 'true') {
        setUser(storedUser ? JSON.parse(storedUser) : DEFAULT_USER_PROFILE);
      }
      setOrders(storedOrders ? JSON.parse(storedOrders) : DEFAULT_ORDERS);
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
    }, 0);
    return () => clearTimeout(timer);
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

  const login = (email, password) => {
    // Accepting any login mock inputs
    if (password) {
      // Mock validation success
    }
    const profile = {
      ...DEFAULT_USER_PROFILE,
      email: email || DEFAULT_USER_PROFILE.email
    };
    setUser(profile);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedDetails) => {
    setUser((prev) => (prev ? { ...prev, ...updatedDetails } : null));
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

  const register = (name, email, phone, password, pincode) => {
    if (password) {
      // Mock validation success
    }
    const profile = {
      name,
      email,
      phone,
      address: '',
      pincode
    };
    setUser(profile);
    return true;
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
        toggleWishlist,
        isWishlisted,
        isAuthModalOpen,
        authModalRedirectTab,
        openAuthModal,
        closeAuthModal,
        register
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
