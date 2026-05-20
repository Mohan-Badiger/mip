"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function CollectionsCards() {
  return (
    <section className="py-10 md:py-16 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 border-t border-gray-100 bg-white">
      <FadeInUp>
        <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-12">Collections</h2>
      </FadeInUp>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-12 lg:gap-16 gap-y-8 md:gap-y-16">
        {[
          { title: "Aradhana", sub: "Inspired by our tradition", img: "/images/bridal_jewellery_1779199671286.png" },
          { title: "Sunshine", sub: "A special craft made to last over time", img: "/images/category_bangles_1779203423031.png" },
          { title: "Kahani", sub: "Bridal Stories", img: "/images/luxury_gold_hero_1779199654262.png" },
          { title: "Rang Mahal", sub: "Semi Precious Stone Jewellery", img: "/images/modern_diamonds_1779199687171.png" },
          { title: "Kerala", sub: "Embrace Kerala's Culture Legacy", img: "/images/bridal_jewellery_1779199671286.png" },
          { title: "Stones", sub: "", img: "/images/category_bangles_1779203423031.png" },
        ].map((item, idx) => (
          <FadeInUp key={item.title} delay={idx * 0.1}>
            <div className="group cursor-pointer">
              <div className="relative h-[160px] md:h-[220px] w-full mb-3 md:mb-4 overflow-hidden bg-gray-50">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />
              </div>
              <h3 className="font-primary text-xl text-brand-brown mb-1 flex items-center gap-1 font-medium tracking-wide">
                {item.title} <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-brown transition-colors" />
              </h3>
              {item.sub && <p className="font-sans text-[11px] text-gray-400 tracking-wider uppercase">{item.sub}</p>}
            </div>
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}
