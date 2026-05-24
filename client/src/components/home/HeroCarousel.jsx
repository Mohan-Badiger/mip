"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MotionLink = motion.create(Link);

const slides = [
  {
    id: 0,
    image: "/images/hero_slide_2.png",
    tag: "New Collection",
    collection: "Aradhana",
    title: "Nature's most graceful bloom,\nset in diamond and gold.",
    cta: "Explore Collection",
    href: "/collections",
    textSide: "left",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-r from-white/60 via-white/10 to-transparent",
  },
  {
    id: 1,
    image: "/images/hero_slide_1.png",
    tag: "Everyday Elegance",
    collection: "Wear it every day,\nlove it forever",
    title: "Diamond jewellery that moves with you",
    price: "Starting from ₹10,000",
    cta: "Shop Now",
    href: "/collections/earrings",
    textSide: "right",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-l from-white/65 via-white/15 to-transparent",
  },
  {
    id: 2,
    image: "/images/hero_slide_3.png",
    tag: "New Schemes",
    collection: "Kanaka Plus",
    title: "Invest once. Redeem in Gold or Silver\nwith no making charges.",
    price: "Start from ₹1,000 / month",
    cta: "Know More",
    href: "/purchase-plan",
    textSide: "left",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-r from-white/65 via-white/15 to-transparent",
  },
  {
    id: 3,
    image: "/images/hero_slide_4.png",
    tag: "Bridal 2025",
    collection: "A Timeless Legacy",
    title: "Handcrafted 916 BIS Hallmarked jewellery\nfor your most precious moments.",
    cta: "View Bridal",
    href: "/collections/necklaces",
    textSide: "right",
    tagColor: "text-yellow-300",
    textColor: "text-white",
    subtitleColor: "text-white/75",
    overlay: "bg-gradient-to-l from-black/55 via-black/20 to-transparent",
  },
];

const SLIDE_INTERVAL = 5000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    const idx = (current - 1 + slides.length) % slides.length;
    goTo(idx, -1);
  }, [current, goTo]);

  const next = useCallback(() => {
    const idx = (current + 1) % slides.length;
    goTo(idx, 1);
  }, [current, goTo]);

  // Auto-scroll
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
      setDirection(1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = slides[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '6%' : '-6%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-6%' : '6%', opacity: 0 }),
  };

  return (
    <div className="max-w-[1940px] mx-auto px-4 md:px-12 lg:px-16 pt-4 md:pt-6 pb-1">
      <div
        className="relative w-full overflow-hidden rounded-xl md:rounded-sm shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Slide ── */}
        <div className="relative w-full h-[450px] md:h-[480px]">
          <AnimatePresence custom={direction} initial={false} mode="sync">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.collection}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Gradient overlay for text readability */}
              <div className={`absolute inset-0 ${slide.overlay}`} />

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-20">
                <div
                  className={`max-w-[90%] md:max-w-[50%] lg:max-w-[45%] flex flex-col gap-2 md:gap-3
                  ${slide.textSide === 'right' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}
                >
                  {/* Tag */}
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    className={`font-primary text-[10px] md:text-xs tracking-[0.25em] uppercase font-semibold ${slide.tagColor}`}
                  >
                    {slide.tag}
                  </motion.span>

                  {/* Collection / Main Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.65 }}
                    className={`font-secondary text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight ${slide.textColor}`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {slide.collection}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className={`font-primary text-xs sm:text-sm md:text-base leading-relaxed ${slide.subtitleColor}`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {slide.title}
                  </motion.p>

                  {/* Price (if present) */}
                  {slide.price && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.55 }}
                      className={`font-secondary text-lg md:text-2xl lg:text-3xl font-normal ${slide.textColor}`}
                    >
                      {slide.price}
                    </motion.p>
                  )}

                  {/* CTA */}
                  <MotionLink
                    href={slide.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.55 }}
                    className={`mt-1 md:mt-2 inline-block font-primary text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase pb-0.5 border-b
                    ${slide.textColor === 'text-white'
                        ? 'border-white/70 text-white hover:border-white'
                        : 'border-brand-gold text-brand-brown hover:text-brand-gold'}
                    transition-colors duration-300`}
                  >
                    {slide.cta}
                  </MotionLink>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Narrow Arrow Buttons ── */}
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-6 md:h-14 md:w-8 flex items-center justify-center bg-white/30 hover:bg-white/60 backdrop-blur-sm transition-all duration-200 rounded-sm group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:text-brand-brown transition-colors" strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-6 md:h-14 md:w-8 flex items-center justify-center bg-white/30 hover:bg-white/60 backdrop-blur-sm transition-all duration-200 rounded-sm group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:text-brand-brown transition-colors" strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Dot Indicators ── */}
        <div className="flex items-center justify-center gap-2.5 py-3 md:py-4">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-400 ${idx === current
                ? 'w-5 h-2 md:w-6 md:h-2 bg-brand-gold'
                : 'w-2 h-2 bg-gray-300 hover:bg-brand-gold/50'
                }`}
            />
          ))}
        </div>

        {/* T&C */}
        <p className="text-center text-[9px] md:text-[10px] text-gray-400 font-primary tracking-wider pb-1">*T&amp;C apply</p>
      </div>
    </div>
  );
}
