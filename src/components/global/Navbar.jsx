import React from 'react';
import { Search, MapPin, User, ShoppingBag, Menu } from 'lucide-react';

export default function Navbar() {
  const navLinks = [
    "EARRINGS", "BANGLES", "CHAINS", "RINGS", "COINS & BARS", "ALL JEWELLERY", "COLLECTIONS", "LEGACY"
  ];

  return (
    <nav className="w-full bg-bg-cream py-4 shadow-sm relative z-40">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center pb-4 border-b border-black/5">
          <div className="flex items-center gap-4">
            <Menu className="md:hidden w-6 h-6 text-brand-brown" />
            <h1 className="font-serif text-xl md:text-2xl tracking-[0.2em] lowercase text-brand-brown">
              mip
            </h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="search..."
              className="w-full py-2 px-4 rounded-full border border-gray-300 bg-transparent text-sm focus:outline-none focus:border-brand-gold transition-colors lowercase text-text-dark placeholder-gray-500"
            />
            <Search className="absolute right-3 top-2 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-text-dark">
            <button className="hidden lg:block hover:text-brand-gold transition-colors lowercase tracking-widest text-[11px]">gift card</button>
            <button className="hidden lg:block text-brand-gold hover:text-brand-gold-light transition-colors lowercase tracking-widest text-[11px]">purchase plan</button>

            <div className="flex gap-4 items-center border-l border-current pl-4">
              <MapPin className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
              <User className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
              <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-brand-gold transition-colors" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-center gap-8 pt-4 text-[11px] tracking-[0.2em] uppercase font-medium text-brand-brown">
          {navLinks.map((link) => (
            <a key={link} href="#" className="relative group overflow-hidden">
              {link}
              <span className="absolute bottom-0 left-0 w-full h-px bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
