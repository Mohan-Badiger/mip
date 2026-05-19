"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroCarousel() {
  return (
    <div className="relative w-full h-screen min-h-[600px] bg-brand-brown overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/luxury_gold_hero_1779199654262.png"
          alt="Luxury Gold Jewellery"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark moody overlay */}
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 max-w-4xl mx-auto mt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-brand-gold lowercase tracking-[0.3em] text-xs md:text-sm mb-6 font-sans font-medium"
        >
          the royal collection
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white font-serif text-4xl md:text-5xl lg:text-6xl lowercase tracking-wide leading-tight mb-8"
        >
          elegance etched <br /> in gold
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className="bg-brand-brown text-brand-gold hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-sans tracking-[0.2em] text-xs py-4 px-10 rounded-full border border-brand-gold lowercase">
            discover the collection
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/50 text-[10px] tracking-widest lowercase mb-2"
        >
          scroll
        </motion.span>
        <div className="w-px h-12 bg-linear-to-b from-white/50 to-transparent"></div>
      </div>
    </div>
  );
}
