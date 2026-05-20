"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FadeInUp from '@/components/global/FadeInUp';

export default function PurchasePlanBanner() {
  return (
    <section className="py-12 md:py-20 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 bg-white">
      <FadeInUp>

        {/* ── Mobile Layout ── */}
        <div className="lg:hidden rounded-sm overflow-hidden shadow-md">
          {/* Gold banner */}
          <div className="bg-[#B5935B] p-8 text-white flex flex-col items-start gap-4">
            <h2 className="font-secondary text-3xl font-normal tracking-wide leading-tight">
              MIP My Choice
            </h2>
            <p className="font-primary text-white/90 text-sm leading-relaxed">
              Join our EMA Jewellery Purchase Plan and avail exciting benefits.
            </p>
            <Link
              href="/purchase-plan"
              className="inline-block font-primary text-xs font-semibold text-white tracking-widest uppercase pb-1 border-b-2 border-white hover:text-brand-brown hover:border-brand-brown transition-colors duration-300"
            >
              Explore
            </Link>
          </div>
          {/* Model image below banner on mobile */}
          <div className="relative w-full h-[280px] bg-[#f0e8d8]">
            <Image
              src="/images/purchase_plan_model.png"
              alt="MIP My Choice Model"
              fill
              sizes="100vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* ── Desktop Layout (lg+): overflowing model ── */}
        <div className="hidden lg:block relative pt-16">
          {/* Gold Banner */}
          <div className="bg-[#B5935B] rounded-sm flex flex-row items-center justify-between h-[280px] w-full shadow-md">
            {/* Left Text */}
            <div className="w-3/5 p-12 lg:p-16 text-white flex flex-col justify-center items-start z-10">
              <h2 className="font-secondary text-4xl lg:text-5xl mb-4 font-normal tracking-wide leading-tight">
                MIP My Choice
              </h2>
              <p className="font-primary text-white/90 text-base mb-6 max-w-md leading-relaxed">
                Join our EMA Jewellery Purchase Plan and avail exciting benefits.
              </p>
              <Link
                href="/purchase-plan"
                className="inline-block font-primary text-sm font-semibold text-white tracking-widest uppercase pb-1 border-b-2 border-white hover:text-brand-brown hover:border-brand-brown transition-colors duration-300"
              >
                Explore
              </Link>
            </div>
            {/* Spacer for model */}
            <div className="w-2/5 h-full" />
          </div>

          {/* Overflowing Model Image */}
          <div className="absolute right-[5%] lg:right-[8%] bottom-0 w-[340px] lg:w-[400px] h-[460px] lg:h-[520px] z-20 pointer-events-none">
            <Image
              src="/images/purchase_plan_model.png"
              alt="MIP My Choice Model"
              fill
              sizes="40vw"
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

      </FadeInUp>
    </section>
  );
}
