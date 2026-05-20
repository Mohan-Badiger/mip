"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function YCollection() {
  return (
    <section className="border-t border-gray-100 bg-white overflow-hidden">

      {/* ══════════════════════════════════════════
          MOBILE layout (hidden on lg+)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden py-12 px-4">
        {/* Header */}
        <FadeInUp>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">
            New Collection
          </p>
          <h2 className="font-secondary text-4xl text-brand-brown leading-tight mb-1">
            Y Collection
          </h2>
          <div className="w-10 h-0.5 bg-brand-gold mt-3 mb-5" />
        </FadeInUp>

        {/* Portrait + sidebar text */}
        <FadeInUp delay={0.1}>
          <div className="flex gap-4 items-stretch mb-6">
            {/* Tall portrait */}
            <div className="relative w-[55%] shrink-0 aspect-2/3 overflow-hidden bg-gray-50">
              <Image
                src="/images/y_collection_pink_1779203438367.png"
                alt="Y Collection Model"
                fill
                sizes="55vw"
                className="object-cover object-top"
                priority
              />
            </div>
            {/* Right text column */}
            <div className="flex flex-col justify-between py-2">
              <div>
                <p className="font-sans text-xs text-gray-400 leading-relaxed">
                  Explore New Age Jewellery from the House of MIP — where bold design meets timeless gold.
                </p>
              </div>
              {/* Small accent image */}
              <div className="relative w-full aspect-square overflow-hidden bg-gray-50 mt-4">
                <Image
                  src="/images/y_collection_pink_1779203438367.png"
                  alt="Y Collection Detail"
                  fill
                  sizes="40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* CTA */}
        <FadeInUp delay={0.2}>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-brand-brown pb-1 border-b border-brand-gold hover:text-brand-gold transition-colors"
          >
            Explore Collection <ArrowUpRight className="w-4 h-4 text-brand-gold" />
          </Link>
        </FadeInUp>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout (lg+) — artistic mosaic
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block py-28 px-16 xl:px-24">
        <div className="relative w-full min-h-[620px] flex items-center justify-center">

          {/* Main Left Portrait */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="absolute left-[8%] top-0 z-20 w-[380px] h-[500px]"
          >
            <Image
              src="/images/y_collection_pink_1779203438367.png"
              alt="Y Collection Model"
              fill
              sizes="30vw"
              className="object-cover object-top"
            />
            <p className="absolute -bottom-8 left-0 text-gray-400 font-sans text-xs tracking-widest uppercase">
              Explore New Age Jewellery
            </p>
          </motion.div>

          {/* Top Right Small Portrait */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            viewport={{ once: true }}
            className="absolute right-[30%] top-[-40px] z-10 w-[160px] h-[200px]"
          >
            <Image
              src="/images/y_collection_pink_1779203438367.png"
              alt="Y Collection Detail"
              fill
              sizes="15vw"
              className="object-cover object-top"
            />
          </motion.div>

          {/* Bottom Right Portrait */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            viewport={{ once: true }}
            className="absolute right-[4%] bottom-[-40px] z-30 w-[280px] h-[380px]"
          >
            <Image
              src="/images/y_collection_pink_1779203438367.png"
              alt="Y Collection Fashion"
              fill
              sizes="22vw"
              className="object-cover object-center"
            />
            <Link
              href="/collections"
              className="absolute -bottom-12 right-0 inline-flex items-center gap-2 font-sans text-base text-brand-brown pb-1 border-b border-brand-gold hover:text-brand-gold transition-colors"
            >
              Explore More <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
          </motion.div>

          {/* Bottom Center Accent */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            viewport={{ once: true }}
            className="absolute bottom-[-100px] left-[47%] z-20 w-[110px] h-[110px] rounded-t-full overflow-hidden"
          >
            <Image
              src="/images/y_collection_pink_1779203438367.png"
              alt="Y Collection Accent"
              fill
              sizes="10vw"
              className="object-cover object-top"
            />
          </motion.div>

          {/* Center Heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative z-40 text-center"
          >
            <div className="bg-white/85 backdrop-blur-sm px-8 py-5">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold mb-2">New Collection</p>
              <h2 className="font-secondary text-5xl xl:text-6xl text-brand-brown">Y Collection</h2>
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}