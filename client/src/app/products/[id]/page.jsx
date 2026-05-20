"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Shield, RotateCcw, Truck, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import PageLayout from '@/components/global/PageLayout';
import { getProductById, getProductsByCategory, formatPrice, getCategoryBySlug } from '@/lib/products';

export default function ProductPage({ params }) {
  const { id } = React.use(params);
  const product = getProductById(id);
  const [activeTab, setActiveTab] = useState('details');
  const [wishlisted, setWishlisted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  if (!product) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="font-secondary text-3xl text-brand-brown mb-4">Product not found</p>
            <Link href="/collections" className="font-sans text-sm text-brand-gold underline">Browse Collections</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const related = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const cat = getCategoryBySlug(product.category);

  const faqs = [
    { q: 'Is this BIS Hallmarked?', a: 'Yes. All MIP gold jewellery is 916 BIS Hallmarked, guaranteeing purity and authenticity.' },
    { q: 'What is the making charge?', a: 'Making charges vary by design and are included in the displayed price. Contact us for a detailed breakup.' },
    { q: 'Can I exchange or return this?', a: 'Yes. MIP offers a lifetime exchange policy. Returns are accepted within 7 days of delivery in original condition.' },
  ];

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link href="/collections" className="hover:text-brand-gold transition-colors">Collections</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link href={`/collections/${product.category}`} className="hover:text-brand-gold transition-colors">{cat?.label}</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown truncate max-w-[120px] md:max-w-none">{product.name}</li>
        </ol>
      </nav>

      {/* Product Detail */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              {product.tag && (
                <span className="absolute top-4 left-4 font-sans text-[9px] tracking-widest uppercase bg-brand-brown text-white px-2.5 py-1">
                  {product.tag}
                </span>
              )}
            </div>
            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {[product.image, product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer border border-transparent hover:border-brand-gold transition-colors">
                  <Image src={img} alt={`View ${i + 1}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-brand-gold mb-2">{cat?.label}</p>
            <h1 className="font-secondary text-2xl md:text-3xl lg:text-4xl text-brand-brown leading-tight mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <p className="font-secondary text-2xl md:text-3xl text-brand-brown">{formatPrice(product.price)}</p>
              <p className="font-sans text-xs text-gray-400 pb-1 tracking-wide">incl. of all taxes</p>
            </div>

            {/* Key details */}
            <div className="grid grid-cols-3 gap-3 mb-6 border-y border-gray-100 py-5">
              {[
                { label: 'Metal', value: product.metal },
                { label: 'Weight', value: product.weight },
                { label: 'Stone', value: product.stone || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center border-r border-gray-100 last:border-r-0">
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-400 mb-1">{label}</p>
                  <p className="font-secondary text-sm text-brand-brown">{value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 bg-brand-brown hover:bg-brand-gold transition-colors text-white font-sans text-xs font-semibold tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-14 flex items-center justify-center border transition-colors ${wishlisted ? 'border-brand-brown bg-brand-brown text-white' : 'border-gray-200 text-brand-brown hover:border-brand-brown'}`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Shield, label: 'BIS Hallmarked' },
                { icon: RotateCcw, label: 'Lifetime Exchange' },
                { icon: Truck, label: 'Free Delivery' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-bg-cream text-center">
                  <Icon className="w-4 h-4 text-brand-gold" strokeWidth={1.5} />
                  <span className="font-sans text-[9px] tracking-wide text-gray-500 uppercase">{label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100">
              <div className="flex gap-6 border-b border-gray-100">
                {['details', 'specifications', 'certifications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-sans text-[10px] tracking-[0.15em] uppercase py-3 border-b-2 transition-colors ${activeTab === tab ? 'border-brand-gold text-brand-brown' : 'border-transparent text-gray-400 hover:text-brand-brown'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-5 font-sans text-sm text-gray-500 leading-relaxed">
                {activeTab === 'details' && (
                  <p>This exquisitely crafted {product.name} from MIP Jewellers exemplifies our commitment to quality. Handcrafted by master artisans, it blends timeless tradition with contemporary elegance. Perfect for daily wear or special occasions.</p>
                )}
                {activeTab === 'specifications' && (
                  <ul className="space-y-2">
                    <li><span className="text-brand-brown font-medium">Metal:</span> {product.metal}</li>
                    <li><span className="text-brand-brown font-medium">Net Weight:</span> {product.weight}</li>
                    {product.stone && <li><span className="text-brand-brown font-medium">Stone:</span> {product.stone}</li>}
                    <li><span className="text-brand-brown font-medium">Hallmark:</span> BIS 916</li>
                    <li><span className="text-brand-brown font-medium">Making Charge:</span> Included in price</li>
                  </ul>
                )}
                {activeTab === 'certifications' && (
                  <div className="space-y-3">
                    <p><span className="text-brand-brown font-medium">BIS Hallmark (HUID):</span> All gold jewellery carries a unique HUID number for easy purity verification.</p>
                    {product.stone === 'Diamond' && <p><span className="text-brand-brown font-medium">IGI / GIA Certified:</span> Diamonds are graded by the International Gemological Institute or the Gemological Institute of America.</p>}
                  </div>
                )}
              </div>
            </div>

            {/* FAQs */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">FAQs</h3>
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center py-3 font-sans text-sm text-brand-brown text-left"
                  >
                    {faq.q}
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-brand-gold shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {openFaq === i && <p className="pb-3 font-sans text-sm text-gray-500 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 py-14 bg-bg-cream">
          <div className="max-w-[1920px] mx-auto px-4 md:px-16">
            <h2 className="font-secondary text-2xl md:text-3xl text-brand-brown mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group">
                  <div className="relative aspect-square bg-white overflow-hidden mb-3">
                    <Image src={p.image} alt={p.name} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-[1.4s]" />
                  </div>
                  <h3 className="font-secondary text-base text-brand-brown group-hover:text-brand-gold transition-colors flex items-center gap-1">
                    {p.name} <ArrowUpRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
