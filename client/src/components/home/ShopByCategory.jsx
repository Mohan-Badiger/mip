"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

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

const CATEGORIES = [
  { name: "Bangles", slug: "bangles", subtitle: "Curated Cuffs", img: "/images/category_bangles.webp" },
  { name: "Chains", slug: "chains", subtitle: "Sleek Links", img: "/images/category_chains.webp" },
  { name: "Earrings", slug: "earrings", subtitle: "Delicate Studs", img: "/images/category_earrings.webp" },
  { name: "Necklaces", slug: "necklaces", subtitle: "Royal Chokers", img: "/images/category_necklaces.webp" },
  { name: "Coins", slug: "coins-bars", subtitle: "Pure Assets", img: "/images/category_coins.webp" },
  { name: "Rings", slug: "rings", subtitle: "Timeless Bands", img: "/images/category_rings.webp" },
];

const GIFT_TIERS = [
  {
    title: "Under ₹15,000",
    label: "Gifts of Light",
    sub: "Spark joy with every sparkle",
    img: "/images/gift_under_15k.webp",
    link: "/products"
  },
  {
    title: "Under ₹50,000",
    label: "Treasured Tokens",
    sub: "Gifts that spark a million memories",
    img: "/images/gift_under_50k.webp",
    link: "/products"
  },
  {
    title: "Under ₹70,000",
    label: "Timeless Legacies",
    sub: "Mark your moments with a timeless piece",
    img: "/images/gift_under_70k.webp",
    link: "/products"
  }
];

export default function ShopByCategory({ categories: propCategories, name }) {
  const SUBTITLES = {
    bangles: "Curated Cuffs",
    chains: "Sleek Links",
    earrings: "Delicate Studs",
    necklaces: "Royal Chokers",
    'coins-bars': "Pure Assets",
    rings: "Timeless Bands",
  };

  const displayCategories = propCategories && propCategories.length > 0
    ? propCategories.map(cat => ({
        name: cat.name || cat.label,
        slug: cat.slug,
        subtitle: SUBTITLES[cat.slug] || cat.description || "Exquisite Designs",
        img: cat.image || "/images/placeholder.webp",
        imagePosition: cat.imagePosition || "50%"
      }))
    : CATEGORIES;

  return (
    <section className="py-16 md:py-28 max-w-480 mx-auto px-4 md:px-16 lg:px-24 border-t border-gray-100 bg-white">

      {/* Category Section */}
      <div className="mb-24">
        <div className="max-w-3xl mb-12">
          <span className="font-primary text-[10px] tracking-[0.35em] uppercase text-brand-gold font-semibold mb-2 block">
            Discover
          </span>
          <h2 className="font-secondary text-3xl md:text-5xl text-brand-brown tracking-wide">
            {name || "Shop By Category"}
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mt-4" />
        </div>

        <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none scrollbar-none gap-6 lg:gap-8 lg:grid-cols-6 pb-8 lg:pb-0 px-2">
          {displayCategories.map((cat, idx) => {
            const adj = parseImageAdjustments(cat.imagePosition);
            return (
              <FadeInUp key={cat.name} delay={idx * 0.08}>
                <Link
                  href={`/collections/${cat.slug}`}
                  className="group block text-center shrink-0 w-[42vw] sm:w-[26vw] lg:w-auto snap-center relative"
                >

                  {/* Image Container with Shop By Gender shape (asymmetric rounded corners) */}
                  <div className="relative w-full aspect-4/5 mb-4 overflow-hidden rounded-tl-[36px] rounded-br-[36px] bg-bg-cream border border-gray-100/50 shadow-sm transition-all duration-700 ease-out group-hover:shadow-md group-hover:border-brand-gold/20">
                    <div className="relative w-full h-full transition-transform duration-[1.8s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105">
                      <Image
                        src={cat.img}
                        alt={cat.name}
                        fill
                        priority={idx < 4}
                        sizes="(max-width: 768px) 42vw, 15vw"
                        className="object-cover"
                        style={{
                          objectPosition: `${adj.x}% ${adj.y}%`,
                          transform: `scale(${adj.scale})`,
                          transformOrigin: `${adj.x}% ${adj.y}%`
                        }}
                      />
                    </div>

                    {/* Subtle vignette overlay at bottom */}
                    <div className="absolute inset-0 bg-linear-to-t from-brand-brown/15 via-transparent to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Inset Border overlay matching the asymmetric shape */}
                    <div className="absolute inset-3 border border-white/25 rounded-tl-3xl rounded-br-3xl pointer-events-none transition-all duration-700 ease-out group-hover:border-brand-gold/35 group-hover:inset-4" />
                  </div>

                {/* Category Labels */}
                <div className="px-1">
                  <p className="font-secondary text-base lg:text-lg text-brand-brown group-hover:text-brand-gold transition-colors duration-300 font-medium">
                    {cat.name}
                  </p>
                  <p className="font-primary text-[8px] lg:text-[9px] tracking-[0.2em] uppercase text-gray-400 mt-1 font-normal group-hover:text-brand-gold/80 transition-colors">
                    {cat.subtitle}
                  </p>
                </div>

              </Link>
            </FadeInUp>
          )})}
        </div>
      </div>

      {/* Gifting Section */}
      <div>
        <div className="mb-12 text-center md:text-left">
          <span className="font-primary text-[10px] tracking-[0.35em] uppercase text-brand-gold font-semibold mb-2 block">
            The Art of Giving
          </span>
          <h2 className="font-secondary text-3xl md:text-5xl text-brand-brown tracking-wide">
            Effortless Gifting
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mt-4 mx-auto md:mx-0" />
        </div>

        {/* Mobile-first scroll track that becomes a grid on desktop - centered and compact */}
        <div className="max-w-5xl mx-auto">
          <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none gap-6 md:gap-8 lg:gap-10 pb-6 md:pb-0 md:grid-cols-3">
            {GIFT_TIERS.map((gift, idx) => (
              <div
                key={gift.title}
                className="w-[65vw] sm:w-[40vw] md:w-auto shrink-0 snap-center md:snap-align-none"
              >
                <FadeInUp delay={idx * 0.1}>
                  <Link href={gift.link} className="group block">
                    {/* Luxury Gift Card Container */}
                    <div className="relative overflow-hidden bg-white p-3 border border-brand-gold/20 shadow-[0_4px_25px_rgba(78,54,41,0.03)] hover:border-brand-gold/60 transition-all duration-[0.6s] ease-[cubic-bezier(0.25,1,0.5,1)] hover:shadow-[0_20px_40px_rgba(179,146,84,0.1)] rounded-sm">
                      {/* Portrait Aspect Ratio for Presentation Boxes */}
                      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-50 mb-4 rounded-sm">
                        <Image
                          src={gift.img}
                          alt={gift.title}
                          fill
                          sizes="(max-width: 768px) 65vw, 30vw"
                          className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                        />
                        {/* Delicate inner gold framing effect */}
                        <div className="absolute inset-3 border border-brand-gold/15 pointer-events-none group-hover:border-brand-gold/45 transition-colors duration-700" />
                      </div>

                      {/* Card details */}
                      <div className="px-2 pb-2">
                        <span className="font-primary text-[10px] tracking-[0.25em] uppercase text-brand-gold font-medium mb-1 block">
                          {gift.title}
                        </span>
                        <h3 className="font-secondary text-base md:text-lg text-brand-brown tracking-wide mb-1 flex items-center justify-between group-hover:text-brand-gold transition-colors duration-300">
                          {gift.label}
                          <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold/40 group-hover:text-brand-gold transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </h3>
                        <p className="font-primary text-[11px] text-gray-400 leading-relaxed font-normal">
                          {gift.sub}
                        </p>
                      </div>
                    </div>
                  </Link>
                </FadeInUp>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
