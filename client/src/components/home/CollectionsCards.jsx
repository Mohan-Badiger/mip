"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInUp from '@/components/global/FadeInUp';

const COLLECTIONS = [
  {
    title: "Aradhana",
    sub: "Inspired by our tradition",
    img: "/images/category_necklaces.webp",
    link: "/products?category=necklaces"
  },
  {
    title: "Sunshine",
    sub: "A craft made to last over time",
    img: "/images/category_bangles.webp",
    link: "/products?category=bangles"
  },
  {
    title: "Kahani",
    sub: "Bridal Stories in Gold",
    img: "/images/category_chains.webp",
    link: "/products?category=rings"
  },
  {
    title: "Rang Mahal",
    sub: "Semi Precious Stone Jewels",
    img: "/images/category_rings.webp",
    link: "/products?category=earrings"
  },
  {
    title: "Kerala",
    sub: "Embrace Culture Legacy",
    img: "/images/category_necklaces.webp",
    link: "/products?category=necklaces"
  },
  {
    title: "Stones",
    sub: "Pure Gold Coins & Bars",
    img: "/images/category_bangles.webp",
    link: "/products?category=coins-bars"
  }
];

const parseImageAdjustments = (val) => {
  if (!val) return { x: 50, y: 50, scale: 1 };
  const parts = val.split(' ');
  if (parts.length === 3) {
    return {
      x: parseInt(parts[0]) || 50,
      y: parseInt(parts[1]) || 50,
      scale: parseFloat(parts[2]) || 1
    };
  }
  const yVal = parseInt(val) || 50;
  return { x: 50, y: yVal, scale: 1 };
};

export default function CollectionsCards({ collections: propCollections, name }) {
  const displayCollections = propCollections && propCollections.length > 0
    ? propCollections.map(col => ({
        title: col.name,
        sub: col.description || "Themed Collection",
        img: col.bannerImage || "/images/category_bangles.webp",
        link: `/products?collection=${col.slug}`,
        imagePosition: col.imagePosition || "50%"
      }))
    : COLLECTIONS;

  return (
    <section className="py-16 md:py-24 max-w-480 mx-auto px-4 md:px-16 lg:px-24 border-t border-gray-100 bg-bg-cream/60 overflow-hidden">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="font-primary text-[10px] tracking-[0.35em] uppercase text-brand-gold font-semibold mb-2.5 block">
          The Heritage Series
        </span>
        <h2 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-brand-brown tracking-wide leading-tight">
          {name || "Modern Collections"}
        </h2>
        {/* Indian Design Accent Divider */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="h-px w-12 bg-brand-gold/40"></span>
          <span className="text-brand-gold text-[8px] rotate-45 border border-brand-gold p-0.5"></span>
          <span className="h-px w-12 bg-brand-gold/40"></span>
        </div>
      </div>

      {/* Swipe indicator (visible only on mobile) */}
      <span className="lg:hidden text-[8px] tracking-[0.25em] text-brand-gold/70 uppercase block text-center -mt-6 mb-8 font-primary animate-pulse">
        Swipe to explore &rarr;
      </span>

      {/* Mobile-first scroll track that becomes a grid on desktop */}
      <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none scrollbar-none gap-4 sm:gap-5 lg:gap-6 pb-6 lg:pb-0 lg:grid-cols-6 scroll-smooth">
        {displayCollections.map((item, idx) => {
          const adj = parseImageAdjustments(item.imagePosition);
          return (
            <div
              key={item.title}
              className="w-[43vw] xs:w-[38vw] sm:w-[28vw] lg:w-auto shrink-0 snap-center lg:snap-align-none"
            >
              <FadeInUp delay={idx * 0.08}>
                <Link href={item.link} className="group block">
                  {/* Indian Royal Arch Frame Container */}
                  <div className="relative p-1.5 border border-brand-gold/25 rounded-t-full bg-white transition-all duration-[0.6s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:border-brand-gold/70 group-hover:shadow-[0_20px_50px_rgba(179,146,84,0.12)]">

                    {/* Perfect Arch Shape Image Mask */}
                    <div className="relative aspect-3/4 w-full overflow-hidden rounded-t-full bg-gray-50">
                      <div className="relative w-full h-full transition-transform duration-[1.8s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
                          className="object-cover"
                          style={{
                            objectPosition: `${adj.x}% ${adj.y}%`,
                            transform: `scale(${adj.scale})`,
                            transformOrigin: `${adj.x}% ${adj.y}%`
                          }}
                        />
                      </div>

                      {/* Subtle Luxury Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-brand-brown/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                  </div>

                {/* Typography details block */}
                <div className="mt-4 text-center px-1">
                  <h3 className="font-secondary text-sm sm:text-base md:text-xl text-brand-brown tracking-wide mb-1 flex items-center justify-center gap-1 group-hover:text-brand-gold transition-colors duration-300">
                    {item.title}
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold/40 group-hover:text-brand-gold transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  {item.sub && (
                    <p className="font-primary text-[9px] md:text-[11px] text-gray-400 tracking-wider uppercase leading-normal">
                      {item.sub}
                    </p>
                  )}
                </div>
              </Link>
            </FadeInUp>
          </div>
        )})}
      </div>
    </section>
  );
}
