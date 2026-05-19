"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function YCollection() {
  return (
    <section className="py-24 max-w-[1920px] mx-auto px-6 md:px-16 lg:px-24 border-t border-gray-100 bg-white overflow-hidden">
      <div className="relative w-full min-h-[600px] flex items-center justify-center">

        {/* Main Left Portrait */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="absolute left-0 md:left-[10%] top-0 z-20 w-[260px] md:w-[340px] h-[420px]"
        >
          <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Model" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover" />
          <p className="absolute -bottom-8 left-0 text-gray-400 font-sans text-xs tracking-wide">Explore New Age Jewellery from the House of MIP</p>
        </motion.div>

        {/* Top Right Small Portrait */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          viewport={{ once: true }}
          className="absolute right-[20%] md:right-[35%] top-[-50px] z-10 w-[130px] md:w-[170px] h-[170px]"
        >
          <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Detail" fill sizes="(max-width: 768px) 50vw, 15vw" className="object-cover object-top" />
        </motion.div>

        {/* Bottom Right Portrait */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          viewport={{ once: true }}
          className="absolute right-0 md:right-[5%] bottom-[-50px] z-30 w-[220px] md:w-[300px] h-[380px]"
        >
          <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Fashion" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover object-center" />
          <a href="#" className="absolute -bottom-10 right-0 inline-flex items-center gap-2 font-sans text-brand-brown text-lg pb-1 border-b-2 border-brand-gold hover:text-brand-gold transition-colors">
            Explore More <ArrowUpRight className="w-5 h-5 text-gray-400" />
          </a>
        </motion.div>

        {/* Bottom Center Very Small Portrait */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          viewport={{ once: true }}
          className="absolute bottom-[-120px] left-[45%] z-20 w-[120px] h-[120px]"
        >
          <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Model" fill sizes="(max-width: 768px) 50vw, 10vw" className="object-cover object-top rounded-t-full" />
        </motion.div>

        {/* Center Text */}
        <div className="relative z-40 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
          <h2 className="font-secondary text-4xl md:text-5xl text-brand-brown">Y Collection</h2>
        </div>

      </div>
    </section>
  );
}
