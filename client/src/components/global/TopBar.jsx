'use client';

import React, { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function TopBar() {
  const { settings } = useSettings();
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
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) throw new Error('Not JSON');
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
    <div 
      className="bg-brand-brown text-white/90 py-1.5 sm:py-2 px-3.5 sm:px-8 flex flex-row justify-between items-center gap-2 transition-all duration-300 select-none"
    >
      {/* Gold Rates - horizontal row on all screens */}
      <div className="flex items-center gap-3 sm:gap-4 font-primary tracking-wider sm:tracking-widest text-[9px] sm:text-[10px] overflow-hidden uppercase">
        <span>22K: ₹{rates.gold22.toLocaleString('en-IN')}/g</span>
        <span className="text-white/20">|</span>
        <span>24K: ₹{rates.gold24.toLocaleString('en-IN')}/g</span>
        <span className="hidden sm:inline text-white/20">|</span>
        <span className="hidden sm:inline">18K: ₹{rates.gold18.toLocaleString('en-IN')}/g</span>
        <span className="hidden md:inline text-white/20">|</span>
        <span className="hidden md:inline">Silver: ₹{rates.silver.toLocaleString('en-IN')}/g</span>
      </div>

      {/* Support Contact - single item on mobile, both on desktop */}
      <div className="flex items-center gap-3 sm:gap-4 tracking-wide font-primary text-[9px] sm:text-[10px] shrink-0">
        <a href={`tel:${settings.supportPhone}`} className="hover:underline transition-all">
          Call: {settings.supportPhone}
        </a>
        <a href={`mailto:${settings.supportEmail}`} className="hidden md:inline hover:underline transition-all">
          {settings.supportEmail}
        </a>
      </div>
    </div>
  );
}
