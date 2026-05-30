"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

/* Inline social SVGs — no lucide-react dependency */
const IgIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const FbIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const YtIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;

const footerSections = [
  {
    title: 'Explore',
    links: [
      { label: 'About Us',           href: '/about' },
      { label: 'Our Stores',          href: '/stores' },
      { label: 'Purchase Plan',       href: '/purchase-plan' },
      { label: 'Gift Cards',          href: '/purchase-plan' },
      { label: 'Contact Us',          href: '/contact' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Earrings',   href: '/collections/earrings' },
      { label: 'Bangles',    href: '/collections/bangles' },
      { label: 'Chains',     href: '/collections/chains' },
      { label: 'Rings',      href: '/collections/rings' },
      { label: 'Necklaces',  href: '/collections/necklaces' },
      { label: 'Coins & Bars', href: '/collections/coins-bars' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Shipping & Returns',  href: '/about#shipping' },
      { label: 'Privacy Policy',       href: '/about#privacy' },
      { label: 'Terms & Conditions',   href: '/about#terms' },
      { label: 'Hallmark Info',        href: '/about#hallmark' },
    ],
  },
];

function AccordionSection({ title, links }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 font-primary text-[10px] tracking-[0.25em] uppercase text-white font-semibold"
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-brand-gold transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-64 pb-4' : 'max-h-0'}`}>
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="font-primary text-sm text-white/65 hover:text-brand-gold transition-colors">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-brand-brown text-white/80">

      {/* ── Top row: brand + social (always visible) ── */}
      <div className="max-w-480 mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-6 md:pb-0 border-b border-white/10 md:border-none">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h3 className="font-secondary text-2xl tracking-[0.25em] text-brand-gold">{settings.brandName.toLowerCase().replace(/\s+/g, '')}</h3>
            <p className="font-primary text-[10px] tracking-[0.2em] uppercase text-white/40 mt-0.5">Since 1925</p>
          </Link>
          {/* Social icons — always visible */}
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
              <IgIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
              <FbIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
              <YtIcon />
            </a>
          </div>
        </div>
      </div>

      {/* ── Mobile: accordion sections ── */}
      <div className="md:hidden px-5 pt-2">
        {footerSections.map((s) => (
          <AccordionSection key={s.title} title={s.title} links={s.links} />
        ))}

        {/* Contact on mobile */}
        <div className="py-5 border-b border-white/10">
          <p className="font-primary text-[10px] tracking-[0.25em] uppercase text-white font-semibold mb-3">Contact</p>
          <ul className="space-y-2">
            <li>
              <a href={`tel:${settings.supportPhone}`} className="font-primary text-sm text-white/65 hover:text-brand-gold transition-colors">
                Toll Free: {settings.supportPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.supportEmail}`} className="font-primary text-sm text-white/65 hover:text-brand-gold transition-colors">
                {settings.supportEmail}
              </a>
            </li>
            {settings.storeAddress && (
              <li className="text-white/50 text-[11px] font-primary pt-1 leading-relaxed">
                {settings.storeAddress}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Desktop: 4-column grid ── */}
      <div className="hidden md:block max-w-480 mx-auto px-8 py-14">
        <div className="grid grid-cols-4 gap-12">
          {/* Brand column */}
          <div>
            <p className="font-primary text-xs text-white/60 leading-relaxed mb-4">
              A Legacy of Purity since 1925. Handcrafted certified hallmarked jewelry blending timeless tradition with modern elegance.
            </p>
            {settings.storeAddress && (
              <p className="font-primary text-[11px] text-white/40 leading-relaxed mb-4">
                {settings.storeAddress}
              </p>
            )}
            <div className="space-y-2">
              <a href={`tel:${settings.supportPhone}`} className="block font-primary text-sm text-white/65 hover:text-brand-gold transition-colors">
                {settings.supportPhone}
              </a>
              <a href={`mailto:${settings.supportEmail}`} className="block font-primary text-sm text-white/65 hover:text-brand-gold transition-colors">
                {settings.supportEmail}
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="font-primary text-[10px] tracking-[0.25em] uppercase text-white font-semibold mb-6">{section.title}</h5>
              <ul className="space-y-3.5">
                {section.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="font-primary text-sm text-white/60 hover:text-brand-gold transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-480 mx-auto px-5 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] font-primary text-white/35">
          <p>&copy; {new Date().getFullYear()} {settings.brandName}. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/about#privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/about#terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/collections" className="hover:text-white/60 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
