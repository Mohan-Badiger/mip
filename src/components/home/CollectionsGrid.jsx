"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

export default function CollectionsGrid() {
  return (
    <section className="py-24 bg-bg-cream relative">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeInUp>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-brown mb-6 lowercase tracking-wide">choose what fits your style from our exquisite collections</h2>
            <p className="font-sans text-text-dark/70 text-sm md:text-base lowercase tracking-wide">blending tradition with modernity, crafted perfectly for your special moments.</p>
          </FadeInUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bridal Banner */}
          <FadeInUp delay={0.1}>
            <div className="group relative h-[600px] overflow-hidden cursor-pointer">
              <Image
                src="/images/bridal_jewellery_1779199671286.png"
                alt="Bridal Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-brand-gold lowercase tracking-widest text-xs font-medium mb-2 block">kahani</span>
                <h3 className="font-serif text-3xl mb-4 lowercase tracking-wide">the bridal story</h3>
                <span className="font-sans text-[10px] tracking-[0.2em] lowercase border-b border-white pb-1 group-hover:border-brand-gold group-hover:text-brand-gold transition-colors">explore now</span>
              </div>
            </div>
          </FadeInUp>

          {/* Modern Banner */}
          <FadeInUp delay={0.2}>
            <div className="group relative h-[600px] overflow-hidden cursor-pointer">
              <Image
                src="/images/modern_diamonds_1779199687171.png"
                alt="Modern Diamonds"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-brand-gold lowercase tracking-widest text-xs font-medium mb-2 block">y collection</span>
                <h3 className="font-serif text-3xl mb-4 lowercase tracking-wide">everyday diamonds</h3>
                <span className="font-sans text-[10px] tracking-[0.2em] lowercase border-b border-white pb-1 group-hover:border-brand-gold group-hover:text-brand-gold transition-colors">explore now</span>
              </div>
            </div>
          </FadeInUp>
        </div>

      </div>
    </section>
  );
}
