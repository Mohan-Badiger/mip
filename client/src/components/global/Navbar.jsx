"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, User, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();
  const { cartCount, isMounted } = useCart();
  const { user, isLoggedIn, login, logout, openAuthModal } = useAuth();

  const navLinks = [
    { label: 'EARRINGS', href: '/collections/earrings' },
    { label: 'BANGLES', href: '/collections/bangles' },
    { label: 'CHAINS', href: '/collections/chains' },
    { label: 'RINGS', href: '/collections/rings' },
    { label: 'COINS & BARS', href: '/collections/coins-bars' },
    { label: 'ALL JEWELLERY', href: '/collections' },
    { label: 'COLLECTIONS', href: '/collections' },
  ];

  return (
    <>
      <nav className="w-full bg-bg-cream py-3 md:py-4">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">

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

            {/* Center: Search bar (desktop only) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 rounded-full border border-gray-300 bg-transparent text-sm focus:outline-none focus:border-brand-gold transition-colors text-text-dark placeholder-gray-500"
              />
              <Search className="absolute right-3 top-2 w-5 h-5 text-gray-400" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-6 text-sm font-medium text-text-dark">
              <Link href="/" className="hidden lg:block hover:text-brand-gold transition-colors tracking-widest text-[11px]">Gift Card</Link>
              <Link href="/purchase-plan" className="hidden lg:block text-brand-gold hover:text-brand-gold-light transition-colors tracking-widest text-[11px]">Purchase Plan</Link>

              <div className="flex gap-3 md:gap-4 items-center border-l border-current pl-3 md:pl-4">
                {/* Search icon on mobile */}
                <Search className="md:hidden w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" aria-label="Search" />
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
                              <span className="text-[8px] text-gray-400 block text-center font-primary">Use any email & password</span>
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jewellery..."
                    className="w-full py-2.5 px-4 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:border-brand-gold transition-colors text-text-dark placeholder-gray-400"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
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
                      <p className="text-[11px] text-brand-brown font-bold font-primary truncate">Access orders & favourites</p>
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
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center py-3.5 text-[12px] tracking-[0.18em] font-medium text-brand-brown hover:text-brand-gold border-b border-black/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-1">
                  <a href="#" onClick={() => setDrawerOpen(false)} className="flex items-center py-3 text-[12px] tracking-widest text-brand-brown hover:text-brand-gold transition-colors border-b border-black/5">Gift Card</a>
                  <Link href="/purchase-plan" onClick={() => setDrawerOpen(false)} className="flex items-center py-3 text-[12px] tracking-widest text-brand-gold font-medium hover:text-brand-gold-light transition-colors">Purchase Plan</Link>
                </div>
              </nav>

              {/* Contact at Bottom */}
              <div className="px-6 py-4 border-t border-black/5 bg-white/50">
                <p className="text-[10px] text-gray-400 tracking-wide">1800-120-1925  ·  support@mip.com</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
