import React from 'react';

export default function TopBar() {
  return (
    <div className="bg-brand-brown text-white/90 text-xs py-2 px-4 md:px-8 flex justify-between items-center">
      <div className="flex gap-4 font-sans tracking-widest text-[10px] overflow-hidden whitespace-nowrap uppercase">
        <span>Gold 22KT: ₹6,750/g</span>
        <span className="hidden sm:inline">Gold 24KT: ₹7,363/g</span>
        <span className="hidden md:inline">Gold 18KT: ₹5,523/g</span>
        <span className="hidden lg:inline">Silver: ₹92/g</span>
      </div>
      <div className="flex gap-4 tracking-wide font-sans">
        <a href="#" className="hover:text-brand-gold transition-colors">1800-120-1925</a>
        <a href="#" className="hidden sm:inline hover:text-brand-gold transition-colors">support@bhimagold.com</a>
      </div>
    </div>
  );
}
