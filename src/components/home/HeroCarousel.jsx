"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
  return (
    <div className="max-w-[1920px] mx-auto px-6 md:px-16 lg:px-15 pb-1 pt-6">
      <div className="relative w-full h-[450px] md:h-[480px] bg-[#F8F3E6] overflow-hidden flex items-center rounded-sm shadow-md">
        {/* Decorative Overlays */}
        <div className="absolute inset-0 border-y-[6px] border-[#D8A452]/20 pointer-events-none z-10" />

        {/* Main Content Container */}
        <div className="max-w-[1920px] mx-auto w-full h-full flex flex-col md:flex-row items-center px-4 md:px-12 relative z-10">

          {/* Left Side - Model Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="hidden md:block md:w-5/12 h-full relative mix-blend-multiply"
          >
            <Image
              src="/images/hero_model_scheme_1779204168417.png"
              alt="Bhima Model"
              fill
              priority
              sizes="50vw"
              className="object-contain object-left"
            />
          </motion.div>

          {/* Right Side - Schemes Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="w-full md:w-7/12 flex flex-col items-center justify-center text-center mt-8 md:mt-0 px-4"
          >
            {/* Red Ribbon / Scroll */}
            <div className="relative mb-12">
              <div className="bg-[#B31D24] border-[3px] border-[#D8A452] shadow-xl relative z-10 px-8 py-3 md:px-16 md:py-4">
                <h2 className="font-secondary text-2xl md:text-3xl text-white uppercase tracking-widest font-normal">
                  New Schemes
                </h2>
              </div>
              {/* Scroll Decorative Rods */}
              <div className="absolute -left-3 top-[-10%] bottom-[-10%] w-3 bg-linear-to-b from-[#FAD284] via-[#8C5D1E] to-[#FAD284] rounded-full shadow-md z-20" />
              <div className="absolute -right-3 top-[-10%] bottom-[-10%] w-3 bg-linear-to-b from-[#FAD284] via-[#8C5D1E] to-[#FAD284] rounded-full shadow-md z-20" />
              <div className="absolute -left-4 top-[-15%] w-5 h-2 bg-[#8C5D1E] rounded-full z-20" />
              <div className="absolute -left-4 bottom-[-15%] w-5 h-2 bg-[#8C5D1E] rounded-full z-20" />
              <div className="absolute -right-4 top-[-15%] w-5 h-2 bg-[#8C5D1E] rounded-full z-20" />
              <div className="absolute -right-4 bottom-[-15%] w-5 h-2 bg-[#8C5D1E] rounded-full z-20" />
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl relative">
              {/* Vertical Divider */}
              <div className="hidden md:block absolute left-1/2 top-[10%] bottom-[10%] w-px bg-brand-brown/20 -translate-x-1/2" />

              {/* Kanaka Plus */}
              <div className="flex flex-col items-center">
                <h3 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-4 font-medium tracking-wide">Kanaka Plus</h3>
                <p className="font-sans text-brand-brown text-sm md:text-base leading-relaxed max-w-[280px]">
                  Invest once.<br />
                  Redeem in Gold or Silver jewellery with no making charges.<br />
                  Also, Diamond & Platinum at extra value.*
                </p>
              </div>

              {/* Shreyas */}
              <div className="flex flex-col items-center">
                <h3 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-4 font-medium tracking-wide">Shreyas</h3>
                <p className="font-sans text-brand-brown text-sm md:text-base leading-relaxed max-w-[320px]">
                  Start from ₹1,000/month.<br />
                  Save now, choose your favourite Gold, Silver, Diamond or Platinum jewellery at maturity.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 transition-colors z-20 cursor-pointer">
          <ChevronLeft className="w-8 h-8 text-brand-brown/50" strokeWidth={1} />
        </button>
        <button className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full hover:bg-black/5 transition-colors z-20 cursor-pointer">
          <ChevronRight className="w-8 h-8 text-brand-brown/50" strokeWidth={1} />
        </button>

        {/* T&C text */}
        <div className="hidden md:block absolute right-8 top-1/2 transform translate-y-1/2 -rotate-90 origin-right text-[12px] uppercase tracking-widest text-brand-brown/60 z-20 font-sans">
          *T&C apply
        </div>
      </div>
    </div>
  );
}
