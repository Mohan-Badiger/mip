"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, SlidersHorizontal, X, ArrowUpRight } from 'lucide-react';
import PageLayout from '@/components/global/PageLayout';
import { getProductsByCategory, getCategoryBySlug, formatPrice } from '@/lib/products';

const METALS = ['22KT Gold', '18KT Gold', '24KT Gold', 'Silver'];
const STONES = ['Diamond', 'Ruby', 'Pearl', 'Emerald'];
const PRICE_RANGES = [
  { label: 'Under ₹25,000', min: 0, max: 25000 },
  { label: '₹25,000–₹50,000', min: 25000, max: 50000 },
  { label: '₹50,000–₹1,00,000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: Infinity },
];
const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

function FilterPanel({ selectedMetals, setSelectedMetals, selectedStones, setSelectedStones, selectedPrice, setSelectedPrice, toggle }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Metal</h3>
        <ul className="space-y-2.5">
          {METALS.map((m) => (
            <li key={m}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={selectedMetals.includes(m)} onChange={() => toggle(selectedMetals, setSelectedMetals, m)} className="accent-brand-gold w-3.5 h-3.5" />
                <span className="font-sans text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{m}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Price</h3>
        <ul className="space-y-2.5">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="radio" name="price" checked={selectedPrice?.label === r.label} onChange={() => setSelectedPrice(selectedPrice?.label === r.label ? null : r)} className="accent-brand-gold w-3.5 h-3.5" />
                <span className="font-sans text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{r.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Stone</h3>
        <ul className="space-y-2.5">
          {STONES.map((s) => (
            <li key={s}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={selectedStones.includes(s)} onChange={() => toggle(selectedStones, setSelectedStones, s)} className="accent-brand-gold w-3.5 h-3.5" />
                <span className="font-sans text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{s}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      {(selectedMetals.length > 0 || selectedStones.length > 0 || selectedPrice) && (
        <button onClick={() => { setSelectedMetals([]); setSelectedStones([]); setSelectedPrice(null); }} className="font-sans text-xs text-brand-gold underline underline-offset-2 tracking-wide hover:text-brand-brown transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default function CategoryPage({ params }) {
  const { category } = React.use(params);
  const cat = getCategoryBySlug(category);
  const allProducts = getProductsByCategory(category);

  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedStones, setSelectedStones] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sort, setSort] = useState('Featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const toggle = (arr, setArr, val) => setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const filtered = allProducts
    .filter((p) => selectedMetals.length === 0 || selectedMetals.includes(p.metal))
    .filter((p) => selectedStones.length === 0 || (p.stone && selectedStones.includes(p.stone)))
    .filter((p) => !selectedPrice || (p.price >= selectedPrice.min && p.price < selectedPrice.max))
    .sort((a, b) => sort === 'Price: Low to High' ? a.price - b.price : sort === 'Price: High to Low' ? b.price - a.price : 0);

  if (!cat) return <PageLayout><div className="flex items-center justify-center min-h-[50vh]"><p className="font-secondary text-2xl text-brand-brown">Category not found</p></div></PageLayout>;

  return (
    <PageLayout>
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-14 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">MIP Jewellers</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">{cat.label}</h1>
        <p className="font-sans text-gray-500 text-sm mt-2">{cat.description}</p>
      </div>

      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link href="/collections" className="hover:text-brand-gold transition-colors">Collections</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">{cat.label}</li>
        </ol>
      </nav>

      <div className="max-w-[1920px] mx-auto px-4 md:px-16 pb-20">
        <div className="flex gap-12">
          <aside className="hidden md:block w-56 shrink-0 pt-2">
            <FilterPanel {...{ selectedMetals, setSelectedMetals, selectedStones, setSelectedStones, selectedPrice, setSelectedPrice, toggle }} />
          </aside>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <p className="font-sans text-xs text-gray-400 tracking-wide">{filtered.length} items</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setFilterOpen(true)} className="md:hidden flex items-center gap-1.5 font-sans text-xs text-brand-brown tracking-wider">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="font-sans text-xs text-brand-brown bg-transparent border-b border-brand-gold/40 pb-0.5 focus:outline-none cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-secondary text-2xl text-gray-300 mb-4">No products found</p>
                <button onClick={() => { setSelectedMetals([]); setSelectedStones([]); setSelectedPrice(null); }} className="font-sans text-sm text-brand-gold underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 gap-y-10">
                {filtered.map((product) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-3">
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105" />
                        {product.tag && <span className="absolute top-2 left-2 font-sans text-[9px] tracking-widest uppercase bg-brand-brown text-white px-2 py-0.5">{product.tag}</span>}
                        <button onClick={(e) => { e.preventDefault(); toggle(wishlist, setWishlist, product.id); }} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Wishlist">
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-brand-brown text-brand-brown' : 'text-brand-brown'}`} />
                        </button>
                      </div>
                      <h3 className="font-secondary text-base md:text-lg text-brand-brown mb-1 flex items-center gap-1 group-hover:text-brand-gold transition-colors">
                        {product.name} <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="font-sans text-[10px] text-gray-400 tracking-wider uppercase mb-1">{product.metal} · {product.weight}</p>
                      <p className="font-sans text-sm text-brand-brown font-medium">{formatPrice(product.price)}</p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-200 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[80vw] max-w-sm bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="font-secondary text-xl text-brand-brown">Filters</span>
              <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5 text-brand-brown" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FilterPanel {...{ selectedMetals, setSelectedMetals, selectedStones, setSelectedStones, selectedPrice, setSelectedPrice, toggle }} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setFilterOpen(false)} className="w-full bg-brand-brown text-white font-sans text-xs font-semibold tracking-widest uppercase py-3">
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
