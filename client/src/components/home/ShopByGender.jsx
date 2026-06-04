"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

const genders = [
  { 
    label: "Women", 
    sub: "For Her", 
    desc: "Curated Selection",
    img: "/images/shop_gender_women.webp", 
    href: "/products?gender=women",
    num: "01" 
  },
  { 
    label: "Men", 
    sub: "For Him", 
    desc: "Modern Classics",
    img: "/images/shop_gender_men.webp", 
    href: "/products?gender=men",
    num: "02" 
  },
  { 
    label: "Kids", 
    sub: "For Them", 
    desc: "Joyful Adornments",
    img: "/images/shop_gender_kids.webp", 
    href: "/products?gender=kids",
    num: "03" 
  },
];

export default function ShopByGender({ name }) {
  return (
    <section className="py-16 md:py-28 border-t border-gray-100 bg-bg-cream/50 overflow-hidden">
      <div className="max-w-480 mx-auto px-4 md:px-16 lg:px-24">

        {/* Section Header */}
        <FadeInUp>
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">Browse By</p>
              <h2 className="font-secondary text-3xl md:text-5xl text-brand-brown">{name || "Shop By Gender"}</h2>
              <div className="w-12 h-0.5 bg-brand-gold mt-4" />
            </div>
            <Link
              href="/collections"
              className="hidden md:inline-flex items-center gap-1.5 font-primary text-[11px] tracking-[0.15em] uppercase text-brand-brown hover:text-brand-gold transition-colors pb-1 border-b border-brand-gold/50"
            >
              View All Collections <ArrowUpRight className="w-4 h-4 text-brand-gold" />
            </Link>
          </div>
        </FadeInUp>

        {/* Gender Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 pt-4 lg:pb-36">
          {genders.map((item, idx) => (
            <FadeInUp key={item.label} delay={idx * 0.15}>
              <Link 
                href={item.href} 
                className={`group block w-[87%] md:w-full ${idx % 2 === 0 ? 'mr-auto md:mr-0' : 'ml-auto md:ml-0'} ${idx === 1 ? 'lg:translate-y-16 lg:hover:translate-y-12' : idx === 2 ? 'lg:translate-y-32 lg:hover:translate-y-28' : 'lg:translate-y-0 lg:hover:-translate-y-4'} transition-all duration-700 ease-out`}
              >

                {/* Card Container with Image and Borders */}
                <div className="relative w-full aspect-4/5 overflow-hidden rounded-tl-[50px] rounded-br-[50px] bg-transparent transition-all duration-700 ease-out mb-5 shadow-sm group-hover:shadow-md">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 85vw, 30vw"
                    className="object-cover object-top transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-brand-brown/55 via-brand-brown/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Elegant Floating Inset Frame */}
                  <div className="absolute inset-4 border border-white/20 rounded-tl-[36px] rounded-br-[36px] pointer-events-none transition-all duration-700 ease-out group-hover:border-brand-gold/40 group-hover:inset-5" />

                  {/* Glassmorphism Badge */}
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-brand-brown/25 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-none transition-all duration-500 group-hover:bg-brand-brown/40">
                    <span className="font-primary text-[10px] tracking-widest text-brand-gold font-semibold">{item.num}</span>
                    <span className="w-1 h-1 rounded-full bg-brand-gold/60" />
                    <span className="font-primary text-[8px] tracking-[0.2em] text-white uppercase">{item.sub}</span>
                  </div>

                  {/* Elegant floating CTA pill */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand-brown text-white hover:bg-brand-gold font-primary text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded-full flex items-center gap-1.5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-md">
                    Shop Now <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                  
                  {/* Bottom overlay text on mobile */}
                  <div className="absolute bottom-5 left-6 right-6 md:hidden">
                    <p className="font-secondary text-2xl text-white">{item.label}</p>
                    <p className="font-primary text-[9px] text-brand-gold tracking-[0.2em] uppercase mt-0.5">{item.desc}</p>
                  </div>
                </div>

                {/* Below image details — visible on tablet/desktop */}
                <div className="hidden md:block px-1">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 group-hover:border-brand-gold/30 transition-colors duration-500">
                    <div>
                      <p className="font-secondary text-2xl lg:text-3xl text-brand-brown group-hover:text-brand-gold transition-colors duration-500">{item.label}</p>
                      <p className="font-primary text-[9px] text-gray-400 tracking-[0.2em] uppercase mt-1 flex items-center gap-1.5">
                        <span className="text-brand-gold font-semibold">{item.sub}</span>
                        <span className="text-gray-300">•</span>
                        <span>{item.desc}</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-brand-gold group-hover:border-brand-gold/30 group-hover:bg-brand-gold/5 transition-all duration-500">
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>

              </Link>
            </FadeInUp>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-4 text-center md:hidden">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 font-primary text-xs tracking-[0.15em] uppercase text-brand-brown hover:text-brand-gold transition-colors border-b border-brand-gold pb-1"
          >
            View All Collections <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold" />
          </Link>
        </div>

      </div>
    </section>
  );
}
