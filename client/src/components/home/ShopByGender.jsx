"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

const genders = [
  { label: "Women", sub: "For Her", img: "/images/shop_gender_women.png", href: "/collections" },
  { label: "Men", sub: "For Him", img: "/images/shop_gender_men.png", href: "/collections" },
  { label: "Kids", sub: "For Them", img: "/images/shop_gender_kids.png", href: "/collections" },
];

export default function ShopByGender() {
  return (
    <section className="py-12 md:py-20 border-t border-gray-100 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24">

        {/* Section Header */}
        <FadeInUp>
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">Browse By</p>
              <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown">Shop By Gender</h2>
            </div>
            <Link
              href="/collections"
              className="hidden md:inline-flex items-center gap-1.5 font-primary text-[11px] tracking-[0.15em] uppercase text-brand-brown hover:text-brand-gold transition-colors pb-px border-b border-brand-gold/50"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </FadeInUp>

        {/* Gender Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-8">
          {genders.map((item, idx) => (
            <FadeInUp key={item.label} delay={idx * 0.1}>
              <Link href={item.href} className="group block">

                {/* Image Container */}
                <div className="relative w-full overflow-hidden bg-gray-50 mb-3 md:mb-4"
                  style={{ aspectRatio: '3/4' }}
                >
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 33vw, 30vw"
                    className="object-cover object-top transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />

                  {/* Gradient overlay — always subtle, darker on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-brand-brown/60 via-brand-brown/0 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Bottom-of-image "Shop" pill — visible on desktop hover */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-sm text-brand-brown font-primary text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Shop {item.label} <ArrowUpRight className="w-3 h-3" />
                  </div>

                  {/* Bottom overlay text on mobile */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 md:hidden">
                    <p className="font-secondary text-base text-white">{item.label}</p>
                  </div>
                </div>

                {/* Below image — desktop only labels */}
                <div className="hidden md:flex justify-between items-center px-1">
                  <div>
                    <p className="font-secondary text-xl text-brand-brown group-hover:text-brand-gold transition-colors">{item.label}</p>
                    <p className="font-primary text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">{item.sub}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-brand-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </div>

              </Link>
            </FadeInUp>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 font-primary text-xs tracking-[0.15em] uppercase text-brand-brown hover:text-brand-gold transition-colors border-b border-brand-gold pb-px"
          >
            View All Collections <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
