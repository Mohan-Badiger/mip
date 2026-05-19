"use client";
import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for joining our family, ${email}!`);
    setEmail('');
  };

  return (
    <section className="py-20 bg-bg-cream border-t border-gray-100">
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 lg:px-24 text-center">
        <FadeInUp>
          <h2 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-brand-brown mb-8 tracking-wide">
            Join Our MIP Family
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 bg-white border border-brand-gold/30 focus:border-brand-gold focus:outline-none text-brand-brown font-sans text-sm tracking-wide rounded-sm placeholder:text-gray-400/80 transition-colors"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-linear-to-r from-[#A68244] to-[#B89758] hover:from-brand-brown hover:to-[#5c4335] text-white font-sans text-sm font-semibold tracking-widest uppercase px-10 py-4 flex items-center justify-center gap-2 rounded-sm transition-all duration-300 shadow-md group cursor-pointer"
            >
              Sign Up
              <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </FadeInUp>
      </div>
    </section>
  );
}
