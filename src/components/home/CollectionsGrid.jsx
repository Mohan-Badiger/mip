"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay }}
  >
    {children}
  </motion.div>
);

export default function CollectionsGrid() {
  return (
    <div className="bg-white">
      
      {/* SECTION 1: Exquisite Collections (Overlapping Images) */}
      <section className="py-24 max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-16">
          <div className="lg:w-1/3 pt-12">
            <FadeInUp>
              <h2 className="font-serif text-3xl md:text-5xl text-brand-brown mb-6 leading-tight">Choose what fits your style from our exquisite collections</h2>
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
              className="absolute z-10 w-[350px] md:w-[450px] h-[550px]"
            >
              <Image src="/images/exquisite_model_1779203407757.png" alt="Model" fill sizes="50vw" className="object-cover" />
            </motion.div>
            
            {/* Left Overlapping Product */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-0 left-0 md:left-[10%] z-20 w-[250px] md:w-[350px] h-[250px] shadow-2xl"
            >
              <Image src="/images/bridal_jewellery_1779199671286.png" alt="Necklace" fill sizes="33vw" className="object-cover" />
            </motion.div>

            {/* Right Overlapping Product */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
              viewport={{ once: true }}
              className="absolute bottom-12 right-0 md:right-[15%] z-20 w-[180px] md:w-[220px] h-[280px] shadow-2xl"
            >
              <Image src="/images/category_bangles_1779203423031.png" alt="Earrings" fill sizes="25vw" className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Collections 6 Grid */}
      <section className="py-16 max-w-[1920px] mx-auto px-4 md:px-8 border-t border-gray-100">
        <FadeInUp>
          <h2 className="font-serif text-3xl md:text-4xl text-brand-brown mb-12">Collections</h2>
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
          {[
            { title: "Aradhana", sub: "Inspired by our tradition", img: "/images/bridal_jewellery_1779199671286.png" },
            { title: "Sunshine", sub: "A special craft made to last over time", img: "/images/category_bangles_1779203423031.png" },
            { title: "Kahani", sub: "Bridal Stories", img: "/images/luxury_gold_hero_1779199654262.png" },
            { title: "Rang Mahal", sub: "Semi Precious Stone Jewellery", img: "/images/modern_diamonds_1779199687171.png" },
            { title: "Kerala", sub: "Embrace Kerala's Culture Legacy", img: "/images/bridal_jewellery_1779199671286.png" },
            { title: "Stones", sub: "", img: "/images/category_bangles_1779203423031.png" },
          ].map((item, idx) => (
            <FadeInUp key={item.title} delay={idx * 0.1}>
              <div className="group cursor-pointer">
                <div className="relative h-[250px] md:h-[300px] w-full mb-4 overflow-hidden bg-gray-50">
                  <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105" />
                </div>
                <h3 className="font-serif text-2xl text-brand-brown mb-1 flex items-center gap-1">
                  {item.title} <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-brown transition-colors" />
                </h3>
                {item.sub && <p className="font-sans text-sm text-gray-500">{item.sub}</p>}
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* SECTION 3: Shop By Category & Effortless Gifting */}
      <section className="py-16 max-w-[1920px] mx-auto px-4 md:px-8 border-t border-gray-100">
        <div className="mb-20">
          <FadeInUp>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-brown mb-8">Shop By Category</h2>
          </FadeInUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["Bangles", "Chains", "Earrings", "Necklaces", "Pendants", "Rings"].map((cat, idx) => (
              <FadeInUp key={cat} delay={idx * 0.1}>
                <div className="group cursor-pointer text-center">
                  <div className="relative aspect-square w-full mb-4 overflow-hidden bg-gray-900 rounded-sm">
                    <Image src="/images/category_bangles_1779203423031.png" alt={cat} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-100" />
                  </div>
                  <p className="font-sans text-sm text-gray-600">{cat}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>

        <div>
          <FadeInUp>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-brown mb-8">Effortless Gifting</h2>
          </FadeInUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Under 15K", sub: "Spark joy with every sparkle" },
              { title: "Under 50K", sub: "Gifts that spark a million memories" },
              { title: "Under 70K", sub: "Mark your moments, with a timeless piece" },
            ].map((gift, idx) => (
              <FadeInUp key={gift.title} delay={idx * 0.1}>
                <div className="group cursor-pointer">
                  <div className="relative h-[250px] w-full mb-4 overflow-hidden bg-gray-900 rounded-sm">
                    <Image src="/images/category_bangles_1779203423031.png" alt={gift.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <h3 className="font-serif text-2xl text-brand-brown mb-1 flex items-center gap-1">
                    {gift.title} <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </h3>
                  <p className="font-sans text-sm text-gray-500">{gift.sub}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Y Collection (Fashion Editorial Layout) */}
      <section className="py-24 max-w-[1920px] mx-auto px-4 md:px-8 border-t border-gray-100 bg-white">
        <div className="relative w-full min-h-[600px] flex items-center justify-center">
          
          {/* Main Left Portrait */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} viewport={{ once: true }}
            className="absolute left-0 md:left-[10%] top-0 z-20 w-[300px] md:w-[400px] h-[500px]"
          >
            <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Model" fill className="object-cover" />
            <p className="absolute -bottom-8 left-0 text-gray-400 font-sans text-sm">Explore New Age Jewellery from the House of Bhima</p>
          </motion.div>

          {/* Top Right Small Portrait */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }} viewport={{ once: true }}
            className="absolute right-[20%] md:right-[35%] top-[-50px] z-10 w-[150px] md:w-[200px] h-[200px]"
          >
            <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Detail" fill className="object-cover object-top" />
          </motion.div>

          {/* Bottom Right Portrait */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 0.4 }} viewport={{ once: true }}
            className="absolute right-0 md:right-[5%] bottom-[-50px] z-30 w-[250px] md:w-[350px] h-[450px]"
          >
            <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Fashion" fill className="object-cover object-center" />
            <a href="#" className="absolute -bottom-10 right-0 inline-flex items-center gap-2 font-sans text-brand-brown text-lg pb-1 border-b-2 border-brand-gold hover:text-brand-gold transition-colors">
              Explore More <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </a>
          </motion.div>

          {/* Bottom Center Very Small Portrait */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.6 }} viewport={{ once: true }}
            className="absolute bottom-[-120px] left-[45%] z-20 w-[150px] h-[150px]"
          >
            <Image src="/images/y_collection_pink_1779203438367.png" alt="Y Collection Model" fill className="object-cover object-top rounded-t-full" />
          </motion.div>

          {/* Center Text */}
          <div className="relative z-40 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
            <h2 className="font-serif text-4xl md:text-5xl text-brand-brown">Y Collection</h2>
          </div>

        </div>
      </section>

    </div>
  );
}
