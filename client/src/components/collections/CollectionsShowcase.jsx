"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Award, Truck, RefreshCw, Gem, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';

export default function CollectionsShowcase({ collections = [] }) {
  // Fallback campaign items if dynamic database collections are empty
  const FALLBACK_COLLECTIONS = [
    {
      _id: "col-1",
      name: "Aradhana Collection",
      description: "Inspired by our rich Indian royal traditions, featuring meticulously crafted heritage gold sets. Each piece reflects centuries of Nakashi and Kundan craftsmanship, tailored for the modern bride seeking timeless legacy.",
      bannerImage: "/images/category_necklaces.png",
      slug: "necklaces",
      specs: [
        "Metal Purity: 22 Karat BIS Hallmarked Gold",
        "Craftsmanship: Traditional Nakashi & Polki Kundan",
        "Aesthetic: Heritage Antique Indian Couture",
        "Signature Piece: Royal Kundan Temple Haram"
      ],
      featuredPieces: [
        { name: "Kundan Heritage Choker", type: "22KT Gold & Polki", price: "₹2,45,000*" },
        { name: "Antique Nakashi Jhumka", type: "Kundan & South Sea Pearls", price: "₹88,000*" },
        { name: "Temple Polki Haram", type: "Heavy Filigree Gold", price: "₹4,12,000*" }
      ]
    },
    {
      _id: "col-2",
      name: "Sunshine Series",
      description: "Traditional kadas to modern stacks designed with gold craftsmanship made to last over time. Combining geometric purity with structural grace, these bangles are designed to be layered and cherished daily.",
      bannerImage: "/images/category_bangles.png",
      slug: "bangles",
      specs: [
        "Metal Purity: 22 Karat Yellow Gold",
        "Craftsmanship: Hand-cut Filigree & Embossed Gold",
        "Aesthetic: Contemporary Classics & Everyday Luxury",
        "Signature Piece: Broad Filigree Royal Kada"
      ],
      featuredPieces: [
        { name: "Broad Filigree Kada", type: "Single Statement Kada", price: "₹1,32,000*" },
        { name: "Everyday Stacking Bangles", type: "Set of 4 Textured Bands", price: "₹1,85,000*" },
        { name: "Royal Gokhru Bangle", type: "Heavy Kerala Antique Gold", price: "₹98,000*" }
      ]
    },
    {
      _id: "col-3",
      name: "Kahani Bridal",
      description: "Capturing wedding stories in gold, eternity bands, and premium solitaires designed for couples. Hand-selected diamonds of exceptional color and clarity, set in handcrafted gold and platinum to last a lifetime.",
      bannerImage: "/images/category_rings.png",
      slug: "rings",
      specs: [
        "Metal Purity: 18KT & 22KT Gold / 950 Platinum",
        "Stone Type: GIA/IGI Certified VVS Diamonds",
        "Aesthetic: Modern Romance & Classic Solitaires",
        "Signature Piece: Eternity Brilliant Cut Diamond Band"
      ],
      featuredPieces: [
        { name: "VVS Solitaire Engagement Ring", type: "18KT White Gold & 1ct Diamond", price: "₹2,10,000*" },
        { name: "Eternity Diamond Band", type: "Round Brilliant Cut Diamonds", price: "₹1,65,000*" },
        { name: "Royal Kundan Statement Ring", type: "Heritage Kundan & Enamel Work", price: "₹54,000*" }
      ]
    }
  ];

  // Map dynamic database collections to include curated fallbacks if needed,
  // or enrich them with default structure if details are missing.
  const displayCollections = collections.length > 0 ? collections.map((col, index) => {
    // If database collection is category slug, merge specs & featured pieces from fallbacks
    const fallback = FALLBACK_COLLECTIONS.find(f => f.slug === col.slug || f.name.toLowerCase().includes(col.name.toLowerCase()));
    return {
      ...col,
      specs: col.specs || fallback?.specs || [
        "Metal Purity: 22 Karat BIS Hallmarked Gold",
        "Craftsmanship: Premium Hand-carved Gold",
        "Aesthetic: Elegant Luxury Style",
        `Signature Piece: Exquisite ${col.name} Set`
      ],
      featuredPieces: fallback?.featuredPieces || [
        { name: `Signature ${col.name} Choker`, type: "22KT Gold & Precious Stones", price: "Price on Request" },
        { name: `Luxury ${col.name} Earrings`, type: "Delicate Heritage Gold", price: "Price on Request" }
      ]
    };
  }) : FALLBACK_COLLECTIONS;

  return (
    <PageLayout>
      <div className="bg-bg-cream min-h-screen selection:bg-brand-gold/20 font-sans">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-7xl mx-auto px-4 md:px-16 pt-8 pb-4">
          <ol className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
            <li className="text-slate-300">/</li>
            <li className="text-brand-brown font-semibold">Collections</li>
          </ol>
        </nav>

        {/* Premium Luxury Hero Section */}
        <section className="relative bg-[#0F0E0C] overflow-hidden min-h-[40vh] md:min-h-[50vh] flex items-center border-b border-brand-gold/25 mb-16 lg:mb-24">
          {/* Background Ambient Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(179,146,84,0.15),transparent_60%)]" />
          <div className="absolute left-0 bottom-0 top-0 w-full md:w-[60%] lg:w-[50%] h-full">
            <Image
              src="/images/exquisite_model.png"
              alt="The Signature Collections"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center opacity-40 md:opacity-60 transition-transform duration-[3s] ease-out hover:scale-105"
            />
            {/* Cinematic Gradient Mask */}
            <div className="absolute inset-0 bg-linear-to-r from-[#0F0E0C] via-[#0F0E0C]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-16 w-full py-12">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                <Gem className="w-3 h-3 text-brand-gold" /> Established 1925
              </span>
              <h1 className="font-secondary text-3xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight uppercase font-medium">
                The Signature <br className="hidden sm:inline" />
                <span className="text-brand-gold font-semibold">Collections</span>
              </h1>
              <div className="w-20 h-0.5 bg-brand-gold" />
              <p className="text-slate-300 text-xs md:text-sm max-w-lg leading-relaxed font-light">
                Discover our curated campaign collections. Handcrafted expressions of royal Indian heritage, contemporary diamond designs, and pure gold assets created to be worn and passed down through generations.
              </p>
            </div>
          </div>
        </section>

        {/* Collections Lookbook List */}
        <section className="max-w-7xl mx-auto px-4 md:px-16 pb-24 space-y-20 lg:space-y-36">
          {displayCollections.map((collection, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={collection._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Image Column with Luxury Frame */}
                <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <Link href={`/products?collection=${collection.slug}`} className="group block relative">
                    {/* Double Luxury Border Frame */}
                    <div className="border border-brand-gold/20 p-2 bg-white rounded-md transition-all duration-700 ease-out group-hover:border-brand-gold/60 shadow-[0_4px_30px_rgba(78,54,41,0.03)] group-hover:shadow-[0_20px_60px_rgba(179,146,84,0.1)]">
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded bg-bg-cream">
                        <Image
                          src={collection.bannerImage || "/images/category_bangles.png"}
                          alt={collection.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0F0E0C]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Text/Content Column */}
                <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center space-y-6 lg:space-y-8`}>
                  <div className="space-y-3">
                    <span className="flex items-center gap-1.5 text-[9px] tracking-[0.25em] uppercase text-brand-gold font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> Campaign Series
                    </span>
                    <h2 className="font-secondary text-2xl lg:text-4xl text-brand-brown tracking-wide leading-tight uppercase font-medium">
                      {collection.name}
                    </h2>
                    <div className="w-12 h-0.5 bg-brand-gold/60" />
                  </div>

                  <p className="text-xs lg:text-sm text-slate-600 leading-relaxed font-light">
                    {collection.description}
                  </p>

                  {/* Curated Specifications List */}
                  {collection.specs && (
                    <div className="bg-white/80 border border-brand-gold/10 p-5 rounded-lg shadow-2xs space-y-3">
                      <h4 className="text-[10px] font-bold text-brand-brown tracking-wider uppercase flex items-center gap-1.5">
                        <Gem className="w-3 h-3 text-brand-gold" /> Collection Details
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {collection.specs.map((spec, sIdx) => (
                          <li key={sIdx} className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-brand-gold mt-0.5 font-bold">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Featured Curated Pieces Mini Showcase */}
                  {collection.featuredPieces && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Signature Pieces Preview</span>
                      <div className="grid grid-cols-3 gap-2.5">
                        {collection.featuredPieces.map((piece, pIdx) => (
                          <div key={pIdx} className="bg-white border border-slate-100 p-2.5 rounded hover:border-brand-gold/30 transition-all flex flex-col justify-between min-h-20 shadow-3xs">
                            <div className="space-y-0.5">
                              <h5 className="text-[10px] font-semibold text-brand-brown truncate" title={piece.name}>{piece.name}</h5>
                              <p className="text-[8px] text-slate-400 capitalize truncate">{piece.type}</p>
                            </div>
                            <span className="text-[9px] font-bold text-brand-gold font-sans block mt-1">{piece.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link 
                      href={`/products?collection=${collection.slug}`}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-brand-gold text-[10px] tracking-[0.25em] uppercase text-brand-brown bg-transparent hover:bg-brand-brown hover:text-white transition-all duration-300 font-semibold"
                    >
                      Explore the Pieces
                      <ArrowRight className="w-4 h-4 transition-transform duration-350" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* MIP Trust & Heritage Legacy Banner */}
        <section className="bg-white border-y border-brand-gold/20 py-20 lg:py-28 font-sans">
          <div className="max-w-7xl mx-auto px-4 md:px-16 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block">
                The MIP Guarantee
              </span>
              <h2 className="font-secondary text-2xl lg:text-4xl text-brand-brown tracking-wide leading-tight uppercase font-medium">
                Pillars of Fine Craftsmanship
              </h2>
              <div className="w-16 h-0.5 bg-brand-gold mx-auto" />
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Since 1925, MIP Jewellers has stood as a beacon of trust, delivering exquisite authenticity and bespoke client satisfaction across India.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
              {[
                { title: "BIS 916 Hallmarked", desc: "Every ounce of gold is certified by government-authorized assaying centers, guaranteeing pure 22K authenticity.", icon: Award },
                { title: "GIA / IGI Certified", desc: "Our diamonds are individually evaluated by gemologists, assuring exact VVS/GH weight, color, and clarity standards.", icon: ShieldCheck },
                { title: "Insured Secure Shipping", desc: "Free fully insured transit across India. Your jewelry travels in secured armored packages to your doorstep.", icon: Truck },
                { title: "Lifetime Trade Exchange", desc: "Enjoy guaranteed transparency and buyback values. Upgrade or exchange your pieces at live market gold rates.", icon: RefreshCw }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="bg-bg-cream border border-brand-gold/10 p-6 rounded-lg text-center space-y-3 hover:border-brand-gold/30 hover:shadow-sm transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto text-brand-gold">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-secondary text-sm font-semibold uppercase text-brand-brown tracking-wider">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom Showcase CTA */}
        <section className="bg-bg-cream/40 py-16 lg:py-24 text-center font-sans">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block">
              Discover Everything
            </span>
            <h2 className="font-secondary text-2xl lg:text-4xl text-brand-brown tracking-wide leading-tight uppercase font-medium">
              Browse the Entire Catalog
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-light">
              View every single ring, chain, necklace, earring, and precious gold coin currently available in our dynamic digital storefront.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center min-w-48 px-10 py-4 bg-brand-brown hover:bg-brand-gold text-white text-[10px] tracking-[0.25em] uppercase transition-colors duration-300 font-bold shadow-md hover:shadow-lg"
              >
                Shop All Jewellery
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
