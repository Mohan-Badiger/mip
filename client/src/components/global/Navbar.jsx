/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, MapPin, User, ShoppingBag, Menu, X, TrendingUp, ArrowUpRight, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/lib/products';

const TRENDING_SEARCHES = [
  { label: 'Necklaces', href: '/collections/necklaces', icon: '📿' },
  { label: 'Bracelets', href: '/collections/bangles', icon: '💛' },
  { label: 'Rings', href: '/collections/rings', icon: '💍' },
  { label: 'Chains', href: '/collections/chains', icon: '⛓️' },
  { label: 'Chokers', href: '/collections/necklaces', icon: '✨' },
  { label: 'Earrings', href: '/collections/earrings', icon: '👂' },
  { label: 'Bangles', href: '/collections/bangles', icon: '🌟' },
  { label: 'Silver', href: '/collections', icon: '🪙' },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchOverlay({ onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 320);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Prevent body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    let active = true;
    const controller = new AbortController();
    fetch(`/api/v1/products?search=${encodeURIComponent(debouncedQuery.trim())}&limit=6`, { signal: controller.signal })
      .then(r => {
        if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error('Not JSON');
        return r.json();
      })
      .then(data => {
        if (active) {
          if (data.success && Array.isArray(data.products)) {
            setResults(data.products);
          } else {
            setResults([]);
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && active) {
          setResults([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsSearching(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleTrending = (href) => {
    router.push(href);
    onClose();
  };

  const handleProductClick = () => {
    onClose();
  };

  const hasQuery = query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-300 flex flex-col"
    >
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-brand-brown/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 bg-bg-cream shadow-2xl"
      >
        {/* Search Input Row */}
        <div className="max-w-225 mx-auto px-4 md:px-8 py-5">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <Search className="w-5 h-5 text-brand-gold shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for jewellery, metals, styles..."
              className="flex-1 bg-transparent text-brand-brown text-lg md:text-xl font-primary placeholder-gray-400 focus:outline-none tracking-wide"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-brand-brown transition-colors p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-brand-brown hover:text-brand-gold transition-colors p-1 shrink-0 ml-2"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
          {/* Animated underline */}
          <div className="h-px bg-linear-to-r from-brand-brown/10 via-brand-gold to-brand-brown/10 mt-4" />
        </div>

        {/* Results / Trending Panel */}
        <div className="max-w-225 mx-auto px-4 md:px-8 pb-8 max-h-[70vh] overflow-y-auto">

          {/* ── Live Search Results (shown when typing) ── */}
          {hasQuery && (
            <div className="mb-6">
              {/* Loading shimmer */}
              {isSearching && (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-14 h-14 bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results list */}
              {!isSearching && results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-primary tracking-[0.25em] uppercase text-gray-400 font-semibold">
                      {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                    </span>
                    <button
                      onClick={() => { router.push(`/products?search=${encodeURIComponent(query.trim())}`); onClose(); }}
                      className="text-[10px] font-primary tracking-widest uppercase text-brand-gold hover:text-brand-brown transition-colors font-semibold flex items-center gap-1"
                    >
                      View all <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {results.map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product.slug || product._id}`}
                        onClick={handleProductClick}
                        className="group flex items-center gap-4 p-3 hover:bg-white transition-all duration-200 border border-transparent hover:border-brand-gold/20"
                      >
                        {/* Product Image */}
                        <div className="w-14 h-14 bg-gray-100 shrink-0 relative overflow-hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">💎</div>
                          )}
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-primary text-sm font-semibold text-brand-brown group-hover:text-brand-gold transition-colors truncate tracking-wide">
                            {product.name}
                          </p>
                          <p className="font-primary text-[11px] text-gray-400 mt-0.5 tracking-wide">
                            {product.metalPurity} {product.metalType?.charAt(0).toUpperCase() + product.metalType?.slice(1)}
                            {product.metalWeight ? ` · ${product.metalWeight}g` : ''}
                          </p>
                        </div>
                        {/* Price */}
                        <div className="shrink-0 text-right">
                          <p className="font-primary text-sm font-semibold text-brand-brown">
                            {formatPrice(product.pricing?.finalPrice || product.price || 0)}
                          </p>
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold transition-colors ml-auto mt-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {!isSearching && results.length === 0 && (
                <div className="py-6">
                  <p className="font-secondary text-lg text-brand-brown mb-1">No results found</p>
                  <p className="font-primary text-xs text-gray-400 tracking-wide">
                    Try searching for &ldquo;rings&rdquo;, &ldquo;gold chains&rdquo; or &ldquo;diamond earrings&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Trending Searches — always visible ── */}
          <div className={hasQuery ? 'border-t border-gray-100 pt-5' : ''}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
              <span className="text-[10px] font-primary tracking-[0.25em] uppercase text-brand-gold font-semibold">
                Trending Searches
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleTrending(item.href)}
                  className="group flex items-center gap-2 px-3.5 py-2 bg-white border border-brand-gold/20 hover:border-brand-gold hover:bg-brand-gold/5 transition-all duration-200 text-sm font-primary text-brand-brown cursor-pointer"
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="tracking-wide text-xs">{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-brand-gold transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories — only on empty state */}
          {!hasQuery && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <span className="text-[10px] font-primary tracking-[0.25em] uppercase text-gray-400 font-semibold block mb-4">
                Browse Categories
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'All Earrings', href: '/collections/earrings', sub: 'Studs, Drops & Hoops' },
                  { label: 'All Bangles', href: '/collections/bangles', sub: 'Gold & Diamond' },
                  { label: 'All Rings', href: '/collections/rings', sub: 'Solitaire & Bands' },
                  { label: 'All Chains', href: '/collections/chains', sub: '18KT & 22KT Gold' },
                ].map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={onClose}
                    className="group p-3.5 bg-white border border-gray-100 hover:border-brand-gold/40 hover:shadow-sm transition-all duration-200"
                  >
                    <p className="font-primary text-xs font-semibold text-brand-brown group-hover:text-brand-gold transition-colors tracking-wide">{cat.label}</p>
                    <p className="font-primary text-[10px] text-gray-400 mt-0.5 tracking-wide">{cat.sub}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Navbar() {
  const { settings } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileResults, setMobileResults] = useState([]);
  const [mobileSearching, setMobileSearching] = useState(false);
  const router = useRouter();
  const { cartCount, isMounted } = useCart();
  const { user, isLoggedIn, login, logout, openAuthModal } = useAuth();
  const debouncedMobileQuery = useDebounce(mobileSearchQuery, 320);

  // Keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Mobile search live results
  useEffect(() => {
    if (!debouncedMobileQuery.trim()) {
      setMobileResults([]);
      return;
    }
    setMobileSearching(true);
    let active = true;
    const controller = new AbortController();
    fetch(`/api/v1/products?search=${encodeURIComponent(debouncedMobileQuery.trim())}&limit=5`, { signal: controller.signal })
      .then(r => {
        if (!r.ok || !r.headers.get('content-type')?.includes('application/json')) throw new Error('Not JSON');
        return r.json();
      })
      .then(data => {
        if (active) {
          if (data.success && Array.isArray(data.products)) {
            setMobileResults(data.products);
          } else {
            setMobileResults([]);
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && active) {
          setMobileResults([]);
        }
      })
      .finally(() => {
        if (active) {
          setMobileSearching(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedMobileQuery]);

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setDrawerOpen(false);
    }
  };

  const navLinks = [
    { label: 'EARRINGS', href: '/collections/earrings' },
    { label: 'BANGLES', href: '/collections/bangles' },
    { label: 'CHAINS', href: '/collections/chains' },
    { label: 'RINGS', href: '/collections/rings' },
    { label: 'COINS & BARS', href: '/collections/coins-bars' },
    { label: 'ALL JEWELLERY', href: '/products' },
  ];

  return (
    <>
      <nav className="w-full bg-bg-cream py-3 md:py-4">
        <div className="max-w-480 mx-auto px-4 md:px-8">

          {/* ── Top Row ── */}
          <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-black/5">

            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden flex items-center justify-center text-brand-brown"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/">
                <h1 className="font-secondary text-xl md:text-2xl tracking-[0.2em] lowercase text-brand-brown">
                  mip
                </h1>
              </Link>
            </div>

            {/* Center: Premium Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 hover:border-brand-gold/60 bg-white/60 hover:bg-white transition-all duration-200 group text-left"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-brand-gold transition-colors shrink-0" strokeWidth={1.5} />
                <span className="flex-1 text-sm font-primary text-gray-400 group-hover:text-gray-500 transition-colors tracking-wide">
                  Search jewellery, metals, styles…
                </span>
                <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-primary text-gray-300 border border-gray-200 tracking-widest">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-6 text-sm font-medium text-text-dark">
              <Link href="/purchase-plan" className="hidden lg:block hover:text-brand-gold transition-colors tracking-widest text-[11px]">Gift Card</Link>
              <Link href="/purchase-plan" className="hidden lg:block text-brand-gold hover:text-brand-gold-light transition-colors tracking-widest text-[11px]">Purchase Plan</Link>

              <div className="flex gap-3 md:gap-4 items-center border-l border-current pl-3 md:pl-4">
                {/* Search icon on mobile */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden flex items-center justify-center hover:text-brand-gold transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 cursor-pointer" />
                </button>
                <Link href="/stores" aria-label="Store locator" className="hover:text-brand-gold transition-colors">
                  <MapPin className="w-5 h-5 cursor-pointer" />
                </Link>
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      if (isMounted && isLoggedIn) {
                        setAccountOpen(!accountOpen);
                      } else {
                        openAuthModal();
                      }
                    }}
                    className="flex items-center justify-center text-text-dark hover:text-brand-gold transition-colors cursor-pointer focus:outline-none"
                    aria-label="Account Menu"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-md border border-brand-gold/25 shadow-[0_10px_35px_rgba(78,54,41,0.08)] py-2.5 z-50 rounded-none text-left font-primary"
                        >
                          {isMounted && isLoggedIn && user ? (
                            <>
                              <div className="px-4 py-2 border-b border-gray-100/60">
                                <p className="text-[9px] text-gray-400 font-primary tracking-widest uppercase font-semibold">Logged In As</p>
                                <p className="text-xs text-brand-brown font-semibold font-primary truncate mt-0.5">{user.name}</p>
                              </div>
                              <Link
                                href="/account?tab=profile"
                                onClick={() => setAccountOpen(false)}
                                className="block px-4 py-2.5 text-xs font-primary text-gray-600 hover:bg-bg-cream/60 hover:text-brand-brown transition-all duration-200 tracking-wide font-medium"
                              >
                                My Account Profile
                              </Link>
                              <Link
                                href="/account?tab=orders"
                                onClick={() => setAccountOpen(false)}
                                className="block px-4 py-2.5 text-xs font-primary text-gray-600 hover:bg-bg-cream/60 hover:text-brand-brown transition-all duration-200 tracking-wide font-medium"
                              >
                                Orders History
                              </Link>
                              <Link
                                href="/account?tab=favourites"
                                onClick={() => setAccountOpen(false)}
                                className="block px-4 py-2.5 text-xs font-primary text-gray-600 hover:bg-bg-cream/60 hover:text-brand-brown transition-all duration-200 tracking-wide font-medium"
                              >
                                Favourites (Wishlist)
                              </Link>
                              <div className="border-t border-gray-100/60 mt-1.5 pt-1.5">
                                <button
                                  onClick={() => {
                                    logout();
                                    setAccountOpen(false);
                                    router.push('/');
                                  }}
                                  className="w-full text-left block px-4 py-2 text-xs font-primary text-red-600 hover:bg-red-50/50 transition-all duration-200 tracking-wide font-semibold cursor-pointer"
                                >
                                  Sign Out
                                </button>
                              </div>
                            </>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const email = e.target.elements.signin_email.value;
                                login(email, '');
                                setAccountOpen(false);
                              }}
                              className="px-4 py-3 space-y-2.5"
                            >
                              <p className="text-[9px] text-brand-brown font-primary tracking-widest uppercase font-bold">Secure Sign In</p>
                              <div>
                                <input
                                  name="signin_email"
                                  type="email"
                                  required
                                  placeholder="your.email@domain.com"
                                  className="w-full text-xs px-2.5 py-2 border border-gray-200 focus:outline-none focus:border-brand-gold font-primary bg-bg-cream/20 text-text-dark"
                                />
                              </div>
                              <div>
                                <input
                                  name="signin_password"
                                  type="password"
                                  required
                                  placeholder="Password"
                                  defaultValue="password"
                                  className="w-full text-xs px-2.5 py-2 border border-gray-200 focus:outline-none focus:border-brand-gold font-primary bg-bg-cream/20 text-text-dark"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white text-[10px] font-primary font-bold tracking-wider py-2 uppercase transition-all cursor-pointer shadow-xs"
                              >
                                Sign In
                              </button>
                              <span className="text-[8px] text-gray-400 block text-center font-primary">Use any email &amp; password</span>
                            </form>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <Link href="/cart" aria-label="Shopping Cart" className="hover:text-brand-gold transition-colors relative flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 cursor-pointer" />
                  {isMounted && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white font-primary font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex justify-center gap-8 pt-4 text-[11px] tracking-[0.2em] font-medium text-brand-brown">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="relative group overflow-hidden">
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-px bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300" />
              </Link>
            ))}
          </div>

        </div>
      </nav>

      {/* ── Full-Screen Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-200 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
              className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-bg-cream flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
                <span className="font-secondary text-xl tracking-[0.2em] lowercase text-brand-brown">mip</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center text-brand-brown hover:text-brand-gold transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="px-6 py-4 border-b border-black/5">
                <form onSubmit={handleMobileSearch} className="relative">
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={e => setMobileSearchQuery(e.target.value)}
                    placeholder="Search jewellery..."
                    className="w-full py-2.5 pl-4 pr-10 border border-gray-200 focus:border-brand-gold bg-white text-sm focus:outline-none font-primary text-text-dark placeholder-gray-400 transition-colors"
                  />
                  {mobileSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => { setMobileSearchQuery(''); setMobileResults([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </form>

                {/* Mobile search results */}
                <AnimatePresence>
                  {mobileSearchQuery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1">
                        {mobileSearching && (
                          <div className="py-3 text-center">
                            <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        )}
                        {!mobileSearching && mobileResults.map(product => (
                          <Link
                            key={product._id}
                            href={`/products/${product.slug || product._id}`}
                            onClick={() => { setDrawerOpen(false); setMobileSearchQuery(''); }}
                            className="flex items-center gap-3 py-2 hover:text-brand-gold transition-colors"
                          >
                            <div className="w-9 h-9 bg-gray-100 shrink-0 relative overflow-hidden">
                              {product.images?.[0] && (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="36px" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-primary text-xs font-semibold text-brand-brown truncate">{product.name}</p>
                              <p className="font-primary text-[10px] text-gray-400">{formatPrice(product.pricing?.finalPrice || 0)}</p>
                            </div>
                          </Link>
                        ))}
                        {!mobileSearching && mobileResults.length === 0 && (
                          <p className="font-primary text-xs text-gray-400 py-2 text-center">No results found</p>
                        )}
                        {!mobileSearching && mobileResults.length > 0 && (
                          <button
                            onClick={handleMobileSearch}
                            className="w-full text-center font-primary text-[10px] tracking-widest uppercase text-brand-gold hover:text-brand-brown transition-colors py-1.5 border-t border-gray-100 mt-1"
                          >
                            View all results
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trending tags (mobile, empty state) */}
                {!mobileSearchQuery && (
                  <div className="pt-3">
                    <p className="text-[9px] font-primary tracking-widest uppercase text-gray-400 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-brand-gold" /> Trending
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_SEARCHES.slice(0, 6).map(item => (
                        <button
                          key={item.label}
                          onClick={() => { router.push(item.href); setDrawerOpen(false); }}
                          className="px-2.5 py-1 text-[9px] font-primary tracking-wide border border-gray-200 text-brand-brown hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer bg-white"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-6 py-2">
                {isMounted && isLoggedIn && user ? (
                  <div className="mb-4 bg-bg-cream/80 p-3 border border-brand-gold/15">
                    <p className="text-[9px] text-gray-400 font-primary tracking-wide uppercase">Welcome back</p>
                    <p className="text-xs text-brand-brown font-bold font-primary truncate mb-2">{user.name}</p>

                    <div className="grid grid-cols-3 gap-2 text-[9px] font-primary font-semibold text-center">
                      <Link
                        href="/account?tab=profile"
                        onClick={() => setDrawerOpen(false)}
                        className="bg-white border border-gray-200 py-1.5 hover:text-brand-gold transition-colors block text-brand-brown"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setDrawerOpen(false)}
                        className="bg-white border border-gray-200 py-1.5 hover:text-brand-gold transition-colors block text-brand-brown"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/account?tab=favourites"
                        onClick={() => setDrawerOpen(false)}
                        className="bg-white border border-gray-200 py-1.5 hover:text-brand-gold transition-colors block text-brand-brown"
                      >
                        Wishlist
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setDrawerOpen(false);
                        router.push('/');
                      }}
                      className="mt-2.5 w-full text-center text-red-600 hover:bg-red-50 border border-red-200/50 py-1 text-[9px] font-primary font-bold uppercase transition-colors cursor-pointer bg-white"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 bg-bg-cream/80 p-3 border border-brand-gold/15 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 font-primary tracking-wide uppercase">Guest Mode</p>
                      <p className="text-[11px] text-brand-brown font-bold font-primary truncate">Access orders &amp; favourites</p>
                    </div>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        openAuthModal();
                      }}
                      className="bg-brand-brown hover:bg-brand-gold text-white text-[10px] font-primary font-bold px-3 py-1.5 uppercase transition-colors shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                )}
                <div className="divide-y divide-black/5">
                  {/* Collapsible Shop Categories */}
                  <div>
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="w-full flex items-center justify-between py-3.5 text-[12px] tracking-[0.18em] font-medium text-brand-brown hover:text-brand-gold transition-colors text-left focus:outline-none cursor-pointer"
                    >
                      <span>SHOP CATEGORIES</span>
                      <ChevronDown className={`w-4 h-4 text-brand-gold transition-transform duration-200 ${categoriesExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {categoriesExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden bg-bg-cream/30 pl-4"
                        >
                          <ul className="pb-2 space-y-1">
                            {[
                              { label: 'EARRINGS', href: '/collections/earrings' },
                              { label: 'BANGLES', href: '/collections/bangles' },
                              { label: 'CHAINS', href: '/collections/chains' },
                              { label: 'RINGS', href: '/collections/rings' },
                              { label: 'COINS & BARS', href: '/collections/coins-bars' },
                              { label: 'ALL JEWELLERY', href: '/products' },
                            ].map((cat) => (
                              <li key={cat.label}>
                                <Link
                                  href={cat.href}
                                  onClick={() => setDrawerOpen(false)}
                                  className="block py-2.5 text-[11px] tracking-[0.15em] text-brand-brown hover:text-brand-gold transition-colors"
                                >
                                  {cat.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Rest of the links */}
                  {[
                    { label: 'PURCHASE PLAN', href: '/purchase-plan' },
                    { label: 'OUR STORES', href: '/stores' },
                    { label: 'ABOUT US', href: '/about' },
                    { label: 'CONTACT US', href: '/contact' },
                  ].map((link) => (
                    <div key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center py-3.5 text-[12px] tracking-[0.18em] font-medium text-brand-brown hover:text-brand-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </div>
                  ))}
                </div>
              </nav>

              {/* Contact at Bottom */}
              <div className="px-6 py-4 border-t border-black/5 bg-white/50">
                <p className="text-[10px] text-gray-400 tracking-wide">{settings.supportPhone}  ·  {settings.supportEmail}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
