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
      className="bg-brand-brown text-white/90 text-xs py-2 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 transition-all duration-300"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start font-primary tracking-widest text-[10px] overflow-hidden uppercase">
        <span>Gold 22KT: ₹{rates.gold22.toLocaleString('en-IN')}/g</span>
        <span>Gold 24KT: ₹{rates.gold24.toLocaleString('en-IN')}/g</span>
        <span className="hidden md:inline">Gold 18KT: ₹{rates.gold18.toLocaleString('en-IN')}/g</span>
        <span className="hidden lg:inline">Silver: ₹{rates.silver.toLocaleString('en-IN')}/g</span>
      </div>
      <div className="flex gap-4 tracking-wide font-primary shrink-0 text-[10px] sm:text-xs">
        <a href={`tel:${settings.supportPhone}`} className="hover:underline transition-all">{settings.supportPhone}</a>
        <a href={`mailto:${settings.supportEmail}`} className="hidden sm:inline hover:underline transition-all">{settings.supportEmail}</a>
      </div>
    </div>
  );
}
