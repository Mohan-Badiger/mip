"use client";

import React from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function AnnouncementBanner() {
  const { settings } = useSettings();

  if (!settings.bannerEnabled || !settings.bannerText) {
    return null;
  }

  return (
    <div 
      className="w-full text-center py-2.5 px-4 text-xs font-semibold tracking-wide uppercase transition-all duration-300 z-50 flex items-center justify-center gap-2 border-b border-white/10"
      style={{ 
        backgroundColor: settings.bannerBgColor, 
        color: settings.bannerTextColor 
      }}
    >
      <span>{settings.bannerText}</span>
    </div>
  );
}
