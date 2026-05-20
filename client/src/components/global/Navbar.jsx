"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, User, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
                <MapPin className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" aria-label="Store locator" />
                <User className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" aria-label="Account" />
                <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" aria-label="Cart" />
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
