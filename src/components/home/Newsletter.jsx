"use client";
import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="py-14 md:py-20 bg-bg-cream border-t border-gray-100">
      <div className="max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 text-center">

        <FadeInUp>
          {/* Decorative label */}
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">
            Exclusive Offers &amp; New Arrivals
          </p>
          <h2 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-brand-brown mb-3 tracking-wide">
            Join Our MIP Family
          </h2>
          <p className="font-sans text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Subscribe to receive early access to collections, festive offers, and jewellery care tips.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          {submitted ? (
            <div className="inline-flex items-center gap-2 font-sans text-brand-brown text-sm tracking-wide border border-brand-gold/40 bg-white px-6 py-3 rounded-sm shadow-sm">
              <span className="text-brand-gold">✓</span> Thank you for joining our family!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch justify-center gap-0 max-w-lg mx-auto shadow-md rounded-sm overflow-hidden"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 min-w-0 px-5 py-4 bg-white border border-brand-gold/30 sm:border-r-0 focus:border-brand-gold focus:outline-none text-brand-brown font-sans text-sm tracking-wide placeholder:text-gray-400/80 transition-colors"
              />
              <button
                type="submit"
                className="shrink-0 whitespace-nowrap bg-linear-to-r from-[#A68244] to-[#B89758] hover:from-brand-brown hover:to-[#5c4335] text-white font-sans text-xs font-semibold tracking-[0.18em] uppercase px-8 py-4 flex items-center justify-center gap-2 transition-all duration-300 group cursor-pointer"
              >
                Sign Up
                <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          )}
        </FadeInUp>

      </div>
    </section>
  );
}
