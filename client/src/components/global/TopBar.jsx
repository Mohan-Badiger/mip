'use client';

import React, { useEffect, useState } from 'react';

export default function TopBar() {
  const [rates, setRates] = useState({
    gold22: 6750,
    gold24: 7363,
    gold18: 5523,
    silver: 92
  });

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/v1/gold-rates');
        const data = await res.json();
        if (data && data.success && Array.isArray(data.rates)) {
          setRates(prevRates => {
            const newRates = { ...prevRates };
            data.rates.forEach(r => {
              if (r.metal === 'gold') {
                if (r.purity === '22KT') newRates.gold22 = r.pricePerGram;
                if (r.purity === '24KT') newRates.gold24 = r.pricePerGram;
                if (r.purity === '18KT') newRates.gold18 = r.pricePerGram;
              } else if (r.metal === 'silver') {
                newRates.silver = r.pricePerGram;
              }
            });
            return newRates;
          });
        }
      } catch {
        // Fallback silently to predefined baseline rates
      }
    }
    fetchRates();
  }, []);

  return (
    <div className="bg-brand-brown text-white/90 text-xs py-2 px-4 md:px-8 flex justify-between items-center">
      <div className="flex gap-4 font-primary tracking-widest text-[10px] overflow-hidden whitespace-nowrap uppercase">
        <span>Bengaluru Gold 22KT: ₹{rates.gold22.toLocaleString('en-IN')}/g</span>
        <span className="hidden sm:inline">Bengaluru Gold 24KT: ₹{rates.gold24.toLocaleString('en-IN')}/g</span>
        <span className="hidden md:inline">Bengaluru Gold 18KT: ₹{rates.gold18.toLocaleString('en-IN')}/g</span>
        <span className="hidden lg:inline">Bengaluru Silver: ₹{rates.silver.toLocaleString('en-IN')}/g</span>
      </div>
      <div className="flex gap-4 tracking-wide font-primary">
        <a href="tel:18001201925" className="hover:text-brand-gold transition-colors">1800-120-1925</a>
        <a href="mailto:support@mip.com" className="hidden sm:inline hover:text-brand-gold transition-colors">support@mip.com</a>
      </div>
    </div>
  );
}
