"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function ExquisiteCollections() {
  return (
    <div className="bg-white">
      <section className="py-12 md:py-16 max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24">

        {/* ── Mobile Layout ── */}
        <div className="lg:hidden flex flex-col gap-8">
          {/* Text */}
          <FadeInUp>
            <h2 className="font-secondary text-3xl text-brand-brown mb-4 leading-tight">
              Luxury That Matches Your Style
            </h2>
            <p className="font-sans text-gray-500 text-sm mb-6 leading-relaxed">
              Blending tradition with modernity. We set the standard for the ultimate in Diamond Jewellery.
            </p>
            <a href="#" className="inline-flex items-center gap-2 font-sans text-brand-brown text-base pb-2 border-b-2 border-brand-gold hover:text-brand-gold transition-colors">
              View Collections <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </a>
          </FadeInUp>

          {/* Images: main portrait + two thumbnails */}
          <FadeInUp delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {/* Main portrait — spans 2 rows on left */}
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-sm shadow-md">
                <Image
                  src="/images/exquisite_model_1779203407757.png"
                  alt="Exquisite jewellery model"
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
              {/* Two small thumbnails stacked right */}
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-sm shadow-md">
                  <Image
                    src="/images/bridal_jewellery_1779199671286.png"
                    alt="Bridal necklace"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded-sm shadow-md">
                  <Image
                    src="/images/category_bangles_1779203423031.png"
                    alt="Gold bangles"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>

        {/* ── Desktop Layout (lg+): original overlapping mosaic ── */}
        <div className="hidden lg:flex flex-row justify-between items-start gap-16">
          {/* Text column */}
          <div className="w-1/3 pt-12">
            <FadeInUp>
              <h2 className="font-secondary text-5xl text-brand-brown mb-6 leading-tight">
                Luxury That Matches Your Style
              </h2>
              <p className="font-sans text-gray-500 text-sm mb-10 leading-relaxed max-w-sm">
                Blending tradition with modernity. We set the standard for the ultimate in Diamond Jewellery.
              </p>
              <a href="#" className="inline-flex items-center gap-2 font-sans text-brand-brown text-lg pb-2 border-b-2 border-brand-gold hover:text-brand-gold transition-colors">
                View Collections <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </a>
            </FadeInUp>
          </div>

          {/* Overlapping image mosaic */}
          <div className="w-2/3 relative h-[600px] flex justify-center">
            {/* Center Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute left-[58%] -translate-x-1/2 z-10 w-[450px] h-[550px]"
            >
              <Image src="/images/exquisite_model_1779203407757.png" alt="Exquisite model" fill sizes="50vw" className="object-cover" />
            </motion.div>

            {/* Left Product */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-0 left-[18%] z-20 w-[350px] h-[250px] shadow-2xl"
            >
              <Image src="/images/bridal_jewellery_1779199671286.png" alt="Necklace" fill sizes="33vw" className="object-cover" />
            </motion.div>

            {/* Right Product */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-12 right-[5%] z-20 w-[220px] h-[280px] shadow-2xl"
            >
              <Image src="/images/category_bangles_1779203423031.png" alt="Earrings" fill sizes="25vw" className="object-cover" />
            </motion.div>
          </div>
        </div>

      </section>
    </div>
  );
}
