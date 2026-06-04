"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function PurchasePlanBanner({ name }) {
  return (
    <section className="py-16 md:py-28 max-w-480 mx-auto px-4 md:px-16 lg:px-24 bg-white overflow-hidden">
      <FadeInUp>
        
        {/* ── Mobile Layout (hidden on lg+) ── */}
        <div className="lg:hidden relative overflow-hidden rounded-tl-[50px] rounded-br-[50px] bg-linear-to-b from-brand-brown via-[#8F754B] to-[#B5935B] shadow-lg border border-brand-gold/20">
          {/* Inner thin frame */}
          <div className="absolute inset-3 border border-white/10 rounded-tl-[40px] rounded-br-[40px] pointer-events-none" />

          {/* Text Content */}
          <div className="relative z-10 p-8 md:p-12 text-white flex flex-col items-start gap-4">
            <span className="font-primary text-[9px] tracking-[0.25em] uppercase text-brand-gold font-semibold">
              Exclusive Purchase Scheme
            </span>
            <h2 className="font-secondary text-3xl md:text-4xl font-normal tracking-wide leading-tight">
              {name || "MIP My Choice"}
            </h2>
            <p className="font-primary text-white/80 text-sm leading-relaxed max-w-md">
              Embark on an effortless path to owning your dream jewelry. Save monthly, bypass making charges, and receive exclusive maturity rewards.
            </p>

            {/* Benefits Stack */}
            <div className="flex flex-col gap-2.5 my-3 w-full">
              {[
                "11-Month Flexible Saving Plan",
                "100% Zero Making Charges",
                "Assured Weight Maturity Bonus"
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10">
                  <Sparkles className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="font-primary text-[10px] text-white/90 tracking-wider uppercase font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/purchase-plan"
              className="group mt-2 inline-flex items-center gap-2 bg-white text-brand-brown hover:bg-brand-gold hover:text-white px-5 py-2.5 rounded-full font-primary text-[10px] tracking-widest uppercase transition-all duration-300 font-semibold shadow-md"
            >
              Join the Plan
              <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold group-hover:text-white transition-colors duration-300" />
            </Link>
          </div>

          {/* Model image below banner on mobile */}
          <div className="relative w-full h-80 mt-2 overflow-hidden">
            {/* Soft gold glow behind the model */}
            <div className="absolute inset-x-0 bottom-0 top-1/4 bg-[radial-gradient(circle_at_center,rgba(181,147,91,0.25)_0%,transparent_70%)] opacity-80" />
            <Image
              src="/images/purchase_plan_model_transparent.webp"
              alt="MIP My Choice Model"
              fill
              sizes="(max-width: 768px) 92vw, (max-width: 1024px) 75vw, 35vw"
              className="object-contain object-bottom"
              priority
            />
            {/* Blend overlay at the very bottom */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#B5935B] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ── Desktop Layout (lg+): overflowing model ── */}
        <div className="hidden lg:block relative pt-20 pb-10">
          
          {/* Gold Banner Background Box */}
          <div className="relative bg-linear-to-r from-brand-brown via-[#8F754B] to-[#B5935B] rounded-tl-[64px] rounded-br-[64px] flex flex-row items-center justify-between h-90 w-full shadow-xl border border-brand-gold/20">
            {/* Inset Decorative Border */}
            <div className="absolute inset-4 border border-white/10 rounded-tl-[52px] rounded-br-[52px] pointer-events-none" />
            
            {/* Gold highlights in background */}
            <div className="absolute right-[25%] top-1/4 w-62.5 h-62.5 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />

            {/* Left Text */}
            <div className="w-7/12 p-16 xl:p-20 text-white flex flex-col justify-center items-start z-10">
              <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-semibold mb-3">
                Exclusive Purchase Scheme
              </span>
              <h2 className="font-secondary text-4xl xl:text-5xl mb-4 font-normal tracking-wide leading-tight">
                {name || "MIP My Choice"}
              </h2>
              <p className="font-primary text-white/80 text-sm xl:text-base mb-6 max-w-lg leading-relaxed">
                Embark on an effortless path to owning your dream jewelry. Save monthly, bypass making charges, and receive exclusive maturity rewards.
              </p>

              {/* Benefits Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  "11-Month Term",
                  "Zero Making Charges",
                  "Weight Maturity Bonus"
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 transition-colors duration-300 hover:bg-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="font-primary text-[9px] tracking-wider text-white/90 uppercase font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/purchase-plan"
                className="group inline-flex items-center gap-2 bg-white text-brand-brown hover:bg-brand-gold hover:text-white px-6 py-3 rounded-full font-primary text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Join the Plan
                <ArrowUpRight className="w-4 h-4 text-brand-gold group-hover:text-white transition-colors duration-300" />
              </Link>
            </div>
            
            {/* Spacer for model overlay */}
            <div className="w-5/12 h-full" />
          </div>

          {/* Overflowing Model Image */}
          <div className="absolute right-[5%] xl:right-[8%] bottom-10 w-95 xl:w-110 h-120 xl:h-137.5 z-20 pointer-events-none">
            {/* Soft gold radial glow behind model */}
            <div className="absolute inset-x-0 bottom-0 top-1/3 bg-[radial-gradient(circle_at_center,rgba(181,147,91,0.30)_0%,transparent_70%)] opacity-80" />
            <Image
              src="/images/purchase_plan_model_transparent.webp"
              alt="MIP My Choice Model"
              fill
              sizes="35vw"
              className="object-contain object-bottom transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-103"
              priority
            />
          </div>
        </div>

      </FadeInUp>
    </section>
  );
}
