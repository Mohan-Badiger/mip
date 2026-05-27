"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollectionsShowcase({ collections = [] }) {
  // Fallback campaign items if dynamic database collections are empty
  const FALLBACK_COLLECTIONS = [
    {
      _id: "col-1",
      name: "Aradhana Collection",
      description: "Inspired by our rich Indian royal traditions, featuring meticulously crafted heritage gold sets.",
      bannerImage: "/images/category_necklaces.png",
      slug: "necklaces"
    },
    {
      _id: "col-2",
      name: "Sunshine Series",
      description: "Traditional kadas to modern stacks designed with gold craftsmanship made to last over time.",
      bannerImage: "/images/category_bangles.png",
      slug: "bangles"
    },
    {
      _id: "col-3",
      name: "Kahani Bridal",
      description: "Capturing wedding stories in gold, eternity bands, and premium solitaires designed for couples.",
      bannerImage: "/images/category_rings.png",
      slug: "rings"
    }
  ];

  const displayCollections = collections.length > 0 ? collections : FALLBACK_COLLECTIONS;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="max-w-480 mx-auto px-4 md:px-16 pt-6.5 pb-4 md:pt-7 md:pb-4 font-sans">
        <ol className="flex items-center gap-2 text-[11px] font-primary text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown font-medium">Collections</li>
        </ol>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-[#0F0E0C] overflow-hidden h-45 sm:h-55 md:h-65 lg:h-75 flex items-center border-b border-gray-900 mb-12 lg:mb-20 font-sans">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[50%] h-full">
          <Image
            src="/images/exquisite_model.png"
            alt="The Collections"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-[2s] ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0F0E0C] via-[#0F0E0C]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-480 mx-auto px-4 md:px-16 w-full flex flex-col items-start text-left">
          <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-1.5 md:mb-2">MIP Heritage</p>
          <h1 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight uppercase">
            The Collections
          </h1>
          <p className="font-primary text-gray-300 text-xs md:text-sm mt-1.5 md:mt-2.5 max-w-60 sm:max-w-sm md:max-w-md lg:max-w-lg leading-relaxed">
            Discover our themed campaign collections. Handcrafted expressions of royal heritage, contemporary design, and pure gold assets curated for every generation.
          </p>
        </div>
      </div>

      {/* Collections Lookbook List */}
      <div className="max-w-480 mx-auto px-4 md:px-16 pb-24 space-y-16 lg:space-y-28">
        {displayCollections.map((collection, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={collection._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center`}
            >
              {/* Image Column */}
              <div className={`lg:col-span-7 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                <Link href={`/collections?collection=${collection.slug}`} className="group block relative overflow-hidden">
                  {/* Luxury Double Gold Border Frame */}
                  <div className="border border-brand-gold/15 p-2 bg-white rounded-sm transition-all duration-700 ease-out group-hover:border-brand-gold/45 shadow-[0_4px_25px_rgba(78,54,41,0.02)] group-hover:shadow-[0_20px_50px_rgba(179,146,84,0.08)]">
                    <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-bg-cream">
                      <Image
                        src={collection.bannerImage || "/images/category_bangles.png"}
                        alt={collection.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-brand-brown/15 via-transparent to-transparent" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Text/Content Column */}
              <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center space-y-4 lg:space-y-6`}>
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 font-primary text-[9px] tracking-[0.25em] uppercase text-brand-gold font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Campaign Series
                  </span>
                  <h2 className="font-secondary text-2xl lg:text-3xl xl:text-4xl text-brand-brown tracking-wide leading-tight uppercase font-medium">
                    {collection.name}
                  </h2>
                  <div className="w-10 h-0.5 bg-brand-gold/55 mt-1" />
                </div>

                <p className="font-primary text-xs lg:text-sm text-gray-500 leading-relaxed">
                  {collection.description || "Discover a unique set of handcrafted designs, tailored for special occasions and heritage styling."}
                </p>

                <div className="pt-2">
                  <Link 
                    href={`/collections?collection=${collection.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-brand-gold text-[10px] tracking-[0.2em] font-primary uppercase text-brand-brown bg-transparent hover:bg-brand-gold hover:text-white transition-all duration-300 font-semibold"
                  >
                    Explore the Pieces
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Showcase CTA */}
      <section className="bg-bg-cream/20 border-t border-brand-gold/15 py-16 lg:py-24 text-center font-sans">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-semibold block">
            Discover Everything
          </span>
          <h2 className="font-secondary text-2xl lg:text-4xl text-brand-brown tracking-wide leading-tight uppercase">
            Browse the Entire Catalog
          </h2>
          <p className="font-primary text-xs lg:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            View every single ring, chain, necklace, earring, and precious coin currently in our dynamic database.
          </p>
          <div className="pt-2">
            <Link
              href="/collections?all=true"
              className="inline-flex items-center justify-center min-w-48 px-8 py-3.5 bg-brand-brown hover:bg-brand-gold text-white text-[10px] tracking-[0.25em] font-primary uppercase transition-colors duration-300 font-bold"
            >
              Shop All Jewellery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
