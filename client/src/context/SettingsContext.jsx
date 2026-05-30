"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    brandName: "MIP Jewellers",
    supportPhone: "1800-120-1925",
    supportEmail: "support@mip.com",
    storeAddress: "123 Heritage Boulevard, MG Road, Bengaluru, Karnataka - 560001",
    bannerEnabled: false,
    bannerText: "",
    bannerBgColor: "#B45309",
    bannerTextColor: "#FFFFFF",
    gstRate: 3.0,
    makingChargeGstRate: 18.0,
    freeShippingThreshold: 50000,
    shippingCharge: 250,
    insuranceFee: 150,
    codAllowed: true,
    codLimit: 20000,
    codExtraCharge: 100,
    allowReturns: true,
    returnPeriodDays: 7
  });
  const [loading, setLoading] = useState(true);

  async function refreshSettings() {
    try {
      const res = await fetch('/api/v1/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data && data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to refresh settings:', e);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/v1/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        if (active && data && data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('SettingsContext failed to load live settings:', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
