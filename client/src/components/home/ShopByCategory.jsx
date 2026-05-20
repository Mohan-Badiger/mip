"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function ShopByCategory() {
  return (
    <section className="py-10 md:py-16 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 border-t border-gray-100 bg-white">
      {/* Category Section */}
      <div className="mb-20">
        <FadeInUp>
          <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-8">Shop By Category</h2>
        </FadeInUp>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-10">
          {[
            { name: "Bangles", slug: "bangles", img: "/images/category_bangles_1779203423031.png" },
            { name: "Chains", slug: "chains", img: "/images/luxury_gold_hero_1779199654262.png" },
            { name: "Earrings", slug: "earrings", img: "/images/product_earrings_1.png" },
            { name: "Necklaces", slug: "necklaces", img: "/images/bridal_jewellery_1779199671286.png" },
            { name: "Coins", slug: "coins-bars", img: "/images/hero_model_scheme_1779204168417.png" },
            { name: "Rings", slug: "rings", img: "/images/modern_diamonds_1779199687171.png" },
          ].map((cat, idx) => (
            <FadeInUp key={cat.name} delay={idx * 0.1}>
              <Link href={`/collections/${cat.slug}`} className="group block text-center">
                <div className="relative aspect-square w-full mb-4 overflow-hidden bg-gray-900 rounded-sm">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-100"
                  />
                </div>
                <p className="font-primary text-[14px] tracking-wider uppercase text-gray-500 group-hover:text-brand-brown transition-colors">{cat.name}</p>
              </Link>
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
                <div className="relative h-[140px] md:h-[200px] w-full mb-3 md:mb-4 overflow-hidden bg-gray-900 rounded-sm">
                  <Image
                    src="/images/category_bangles_1779203423031.png"
                    alt={gift.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-primary text-xl text-brand-brown mb-1 flex items-center gap-1 font-medium tracking-wide">
                  {gift.title} <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-brown transition-colors" />
                </h3>
                <p className="font-primary text-[11px] text-gray-400 tracking-wider uppercase">{gift.sub}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
