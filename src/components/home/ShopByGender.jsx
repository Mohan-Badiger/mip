"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function ShopByGender() {
  return (
    <section className="py-10 md:py-16 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 border-t border-gray-100 bg-white">
      <FadeInUp>
        <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-12">Shop By Gender</h2>
      </FadeInUp>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-12">
        {[
          { label: "Women", img: "/images/shop_gender_women.png" },
          { label: "Men", img: "/images/shop_gender_men.png" },
          { label: "Kids", img: "/images/shop_gender_kids.png" }
        ].map((item, idx) => (
          <FadeInUp key={item.label} delay={idx * 0.1}>
            <div className="group cursor-pointer">
              <div className="relative aspect-3/4 w-full mb-4 overflow-hidden bg-gray-50 rounded-sm">
                <Image
                  src={item.img}
                  alt={item.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="font-secondary text-xl text-brand-brown font-medium tracking-wide">
                  {item.label}
                </span>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-brown transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </FadeInUp>
        ))}
      </div>
    </section>
  );
}
