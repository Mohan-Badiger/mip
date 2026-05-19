"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function ShopByCategory() {
  return (
    <section className="py-16 max-w-[1920px] mx-auto px-6 md:px-16 lg:px-24 border-t border-gray-100 bg-white">
      {/* Category Section */}
      <div className="mb-20">
        <FadeInUp>
          <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-8">Shop By Category</h2>
        </FadeInUp>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10">
          {["Bangles", "Chains", "Earrings", "Necklaces", "Pendants", "Rings"].map((cat, idx) => (
            <FadeInUp key={cat} delay={idx * 0.1}>
              <div className="group cursor-pointer text-center">
                <div className="relative aspect-square w-full mb-4 overflow-hidden bg-gray-900 rounded-sm">
                  <Image
                    src="/images/category_bangles_1779203423031.png"
                    alt={cat}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-100"
                  />
                </div>
                <p className="font-sans text-[11px] tracking-wider uppercase text-gray-500">{cat}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>

      {/* Gifting Section */}
      <div>
        <FadeInUp>
          <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-8">Effortless Gifting</h2>
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {[
            { title: "Under 15K", sub: "Spark joy with every sparkle" },
            { title: "Under 50K", sub: "Gifts that spark a million memories" },
            { title: "Under 70K", sub: "Mark your moments, with a timeless piece" },
          ].map((gift, idx) => (
            <FadeInUp key={gift.title} delay={idx * 0.1}>
              <div className="group cursor-pointer">
                <div className="relative h-[180px] md:h-[200px] w-full mb-4 overflow-hidden bg-gray-900 rounded-sm">
                  <Image
                    src="/images/category_bangles_1779203423031.png"
                    alt={gift.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-secondary text-xl text-brand-brown mb-1 flex items-center gap-1 font-medium tracking-wide">
                  {gift.title} <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-brown transition-colors" />
                </h3>
                <p className="font-sans text-[11px] text-gray-400 tracking-wider uppercase">{gift.sub}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
