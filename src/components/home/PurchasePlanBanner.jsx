"use client";
import React from 'react';
import Image from 'next/image';
import FadeInUp from '@/components/global/FadeInUp';

export default function PurchasePlanBanner() {
  return (
    <section className="py-20 max-w-[1920px] mx-auto px-6 md:px-16 lg:px-24">
      <FadeInUp>
        <div className="relative pt-12 md:pt-16">
          {/* Flat Gold Banner Block */}
          <div className="bg-[#B5935B] rounded-sm flex flex-col md:flex-row items-center justify-between min-h-[260px] md:h-[280px] w-full shadow-md">
            {/* Left Text Column */}
            <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 text-white flex flex-col justify-center items-start z-10">
              <h2 className="font-secondary text-3xl md:text-4xl lg:text-5xl mb-4 font-normal tracking-wide leading-tight">
                MIP My Choice
              </h2>
              <p className="font-sans text-white/90 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                Join our EMA Jewellery Purchase Plan and avail exciting benefits.
              </p>
              <a
                href="#"
                className="inline-block font-sans text-xs md:text-sm font-semibold text-white tracking-widest uppercase pb-1 border-b-2 border-white hover:text-brand-brown hover:border-brand-brown transition-colors duration-300"
              >
                Explore
              </a>
            </div>

            {/* Right Column spacer for desktop */}
            <div className="w-full md:w-2/5 h-36 md:h-full" />
          </div>

          {/* Overflowing Image Container */}
          <div className="absolute right-4 md:right-[5%] lg:right-[8%] bottom-0 w-[280px] md:w-[340px] lg:w-[400px] h-[380px] md:h-[460px] lg:h-[520px] z-20 pointer-events-none">
            <Image
              src="/images/purchase_plan_model.png"
              alt="MIP My Choice Model"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}
