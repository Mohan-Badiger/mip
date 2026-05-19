"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function ExquisiteCollections() {
  return (
    <div className="bg-white">
      <section className="py-12 max-w-[1920px] mx-auto px-6 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-16">
          <div className="lg:w-1/3 pt-12">
            <FadeInUp>
              <h2 className="font-secondary text-3xl md:text-5xl text-brand-brown mb-6 leading-tight">Choose what fits your style from our exquisite collections</h2>
              <p className="font-sans text-gray-500 text-sm mb-10 leading-relaxed max-w-sm">
                Blending tradition with modernity. We set the standard for the ultimate in Diamond Jewellery.
              </p>
              <a href="#" className="inline-flex items-center gap-2 font-sans text-brand-brown text-lg pb-2 border-b-2 border-brand-gold hover:text-brand-gold transition-colors">
                View Collections <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </a>
            </FadeInUp>
          </div>

          <div className="lg:w-2/3 relative h-[600px] w-full flex justify-center">
            {/* Center Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute left-[58%] -translate-x-1/2 z-10 w-[350px] md:w-[450px] h-[550px]"
            >
              <Image src="/images/exquisite_model_1779203407757.png" alt="Model" fill sizes="50vw" className="object-cover" />
            </motion.div>

            {/* Left Overlapping Product */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-0 left-[5%] md:left-[12%] lg:left-[18%] z-20 w-[250px] md:w-[350px] h-[250px] shadow-2xl"
            >
              <Image src="/images/bridal_jewellery_1779199671286.png" alt="Necklace" fill sizes="33vw" className="object-cover" />
            </motion.div>

            {/* Right Overlapping Product */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-12 right-0 md:right-[2%] lg:right-[5%] z-20 w-[180px] md:w-[220px] h-[280px] shadow-2xl"
            >
              <Image src="/images/category_bangles_1779203423031.png" alt="Earrings" fill sizes="25vw" className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
