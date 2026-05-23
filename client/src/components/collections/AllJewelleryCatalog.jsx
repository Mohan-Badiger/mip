"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, SlidersHorizontal, X, ArrowUpRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';
import JewelryLoader from '@/components/global/JewelryLoader';
import { categories, formatPrice } from '@/lib/products';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

const METALS = ['22KT Gold', '18KT Gold', '24KT Gold', 'Silver'];
const STONES = ['Diamond', 'Ruby', 'Pearl', 'Emerald'];
const PRICE_RANGES = [
  { label: 'Under ₹25,000', min: 0, max: 25000 },
  { label: '₹25,000–₹50,000', min: 25000, max: 50000 },
  { label: '₹50,000–₹1,00,000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: Infinity },
];
const SORT_OPTIONS = ['Featured', 'Low to High', 'High to Low', 'Newest'];

function FilterPanel({
  selectedCategories,
  setSelectedCategories,
  selectedGenders,
  setSelectedGenders,
  selectedMetals,
  setSelectedMetals,
  selectedStones,
  setSelectedStones,
  selectedPrice,
  setSelectedPrice,
  toggle
}) {
  return (
    <div className="space-y-8">
      {/* Category Checkboxes */}
      <div>
        <h3 className="font-primary text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Category</h3>
        <ul className="space-y-2.5">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggle(selectedCategories, setSelectedCategories, cat.slug)}
                  className="accent-brand-gold w-3.5 h-3.5"
                />
                <span className="font-primary text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{cat.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Gender Checkboxes */}
      <div>
        <h3 className="font-primary text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Gender</h3>
        <ul className="space-y-2.5">
          {['Women', 'Men', 'Kids'].map((gender) => (
            <li key={gender}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes(gender)}
                  onChange={() => toggle(selectedGenders, setSelectedGenders, gender)}
                  className="accent-brand-gold w-3.5 h-3.5"
                />
                <span className="font-primary text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{gender}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Metal Checkboxes */}
      <div>
        <h3 className="font-primary text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Metal</h3>
        <ul className="space-y-2.5">
          {METALS.map((m) => (
            <li key={m}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedMetals.includes(m)}
                  onChange={() => toggle(selectedMetals, setSelectedMetals, m)}
                  className="accent-brand-gold w-3.5 h-3.5"
                />
                <span className="font-primary text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{m}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Radio Ranges */}
      <div>
        <h3 className="font-primary text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Price</h3>
        <ul className="space-y-2.5">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === r.label}
                  onChange={() => setSelectedPrice(selectedPrice?.label === r.label ? null : r)}
                  className="accent-brand-gold w-3.5 h-3.5"
                />
                <span className="font-primary text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{r.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Stone Checkboxes */}
      <div>
        <h3 className="font-primary text-[10px] tracking-[0.2em] uppercase text-brand-brown font-semibold mb-4">Stone</h3>
        <ul className="space-y-2.5">
          {STONES.map((s) => (
            <li key={s}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedStones.includes(s)}
                  onChange={() => toggle(selectedStones, setSelectedStones, s)}
                  className="accent-brand-gold w-3.5 h-3.5"
                />
                <span className="font-primary text-sm text-gray-600 group-hover:text-brand-brown transition-colors">{s}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {(selectedCategories.length > 0 || selectedGenders.length > 0 || selectedMetals.length > 0 || selectedStones.length > 0 || selectedPrice) && (
        <button
          onClick={() => {
            setSelectedCategories([]);
            setSelectedGenders([]);
            setSelectedMetals([]);
            setSelectedStones([]);
            setSelectedPrice(null);
          }}
          className="font-primary text-xs text-brand-gold underline underline-offset-2 tracking-wide hover:text-brand-brown transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialGender = searchParams.get('gender');
  const initialCategory = searchParams.get('category');

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedStones, setSelectedStones] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sort, setSort] = useState('Featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const { toggleWishlist, isWishlisted, isMounted: authMounted } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (arr, setArr, val) => setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  // Load initial URL states
  useEffect(() => {
    if (initialGender) {
      const formatted = initialGender.charAt(0).toUpperCase() + initialGender.slice(1).toLowerCase();
      setSelectedGenders([formatted]);
    }
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialGender, initialCategory]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/v1/products?limit=100');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const mapped = data.products.map(p => ({
            id: p._id,
            slug: p.slug,
            name: p.name,
            category: p.category?.slug || p.category,
            image: p.images[0] || '/images/placeholder.png',
            price: p.pricing?.finalPrice || p.price,
            weight: p.metalWeight + 'g',
            metal: `${p.metalPurity} ${p.metalType.charAt(0).toUpperCase() + p.metalType.slice(1)}`,
            stone: p.gemstones && p.gemstones[0] ? (p.gemstones[0].type.charAt(0).toUpperCase() + p.gemstones[0].type.slice(1)) : null,
            tag: p.tag || (p.stock < 3 ? 'Low Stock' : null),
            gender: p.gender || 'Women'
          }));
          setProductsList(mapped);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Update URL SearchParams to mirror current state
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length === 1) {
      params.set('category', selectedCategories[0]);
    }
    if (selectedGenders.length === 1) {
      params.set('gender', selectedGenders[0].toLowerCase());
    }
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedCategories, selectedGenders]);

  const filtered = productsList
    .filter((p) => selectedCategories.length === 0 || selectedCategories.includes(p.category))
    .filter((p) => selectedGenders.length === 0 || selectedGenders.includes(p.gender))
    .filter((p) => selectedMetals.length === 0 || selectedMetals.includes(p.metal))
    .filter((p) => selectedStones.length === 0 || (p.stone && selectedStones.includes(p.stone)))
    .filter((p) => !selectedPrice || (p.price >= selectedPrice.min && p.price < selectedPrice.max))
    .sort((a, b) => sort === 'Low to High' ? a.price - b.price : sort === 'High to Low' ? b.price - a.price : 0);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 pt-[26px] pb-4 md:pt-7 md:pb-4">
        <ol className="flex items-center gap-2 text-[11px] font-primary text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown font-medium">All Jewellery</li>
        </ol>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-[#0F0E0C] overflow-hidden h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] flex items-center border-b border-gray-900 mb-8">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[50%] h-full">
          <Image
            src="/images/exquisite_model_1779203407757.png"
            alt="All Jewellery"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-[2s] ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0C] via-[#0F0E0C]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-16 w-full flex flex-col items-start text-left">
          <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-1.5 md:mb-2">MIP Jewellers</p>
          <h1 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight">
            All Jewellery
          </h1>
          <p className="font-primary text-gray-300 text-xs md:text-sm mt-1.5 md:mt-2.5 max-w-[240px] sm:max-w-sm md:max-w-md lg:max-w-lg leading-relaxed">
            Explore our complete handcrafted collections. Gold, diamonds, platinum and precious gemstones curated for every generation.
          </p>
        </div>
      </div>

      {/* Main Listing Area */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-16 pb-20">
        <div className="flex gap-12">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-56 shrink-0 pt-2">
            <FilterPanel {...{
              selectedCategories, setSelectedCategories,
              selectedGenders, setSelectedGenders,
              selectedMetals, setSelectedMetals,
              selectedStones, setSelectedStones,
              selectedPrice, setSelectedPrice,
              toggle
            }} />
          </aside>

          {/* Grid Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <p className="font-primary text-xs text-gray-400 tracking-wide">{filtered.length} items</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setFilterOpen(true)} className="md:hidden flex items-center gap-1.5 font-primary text-xs text-brand-brown tracking-wider">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                
                {/* Premium Custom Dropdown Sort Filter */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-1.5 font-primary text-xs text-brand-brown tracking-wider bg-transparent border-b border-brand-gold/40 pb-0.5 focus:outline-none cursor-pointer"
                  >
                    <span>{sort}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-brand-gold transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-48 bg-white border border-brand-gold/20 shadow-[0_10px_30px_rgba(78,54,41,0.06)] py-1.5 z-40 rounded-none text-left font-primary"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSort(option);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs transition-all duration-200 cursor-pointer ${
                              sort === option
                                ? 'bg-bg-cream font-semibold text-brand-gold'
                                : 'text-gray-600 hover:bg-bg-cream/60 hover:text-brand-brown'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] w-full">
                <JewelryLoader size="lg" label="Displaying premium catalog..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-secondary text-2xl text-gray-300 mb-4">No products found</p>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedGenders([]);
                    setSelectedMetals([]);
                    setSelectedStones([]);
                    setSelectedPrice(null);
                  }}
                  className="font-sans text-sm text-brand-gold underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 gap-y-10">
                {filtered.map((product) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                        />
                        {product.tag && (
                          <span className="absolute top-2 left-2 font-primary text-[9px] tracking-widest uppercase bg-brand-brown text-white px-2 py-0.5">
                            {product.tag}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${authMounted && isWishlisted(product.id) ? 'fill-brand-brown text-brand-brown' : 'text-brand-brown'}`}
                          />
                        </button>
                      </div>
                      <h3 className="font-secondary text-base md:text-lg text-brand-brown mb-1 flex items-center gap-1 group-hover:text-brand-gold transition-colors">
                        {product.name}
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="font-primary text-[10px] text-gray-400 tracking-wider uppercase mb-1">{product.metal} · {product.weight}</p>
                      <p className="font-primary text-sm text-brand-brown font-medium">{formatPrice(product.price)}</p>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filters */}
      {filterOpen && (
        <div className="fixed inset-0 z-200 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[80vw] max-w-sm bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="font-secondary text-xl text-brand-brown">Filters</span>
              <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5 text-brand-brown" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FilterPanel {...{
                selectedCategories, setSelectedCategories,
                selectedGenders, setSelectedGenders,
                selectedMetals, setSelectedMetals,
                selectedStones, setSelectedStones,
                selectedPrice, setSelectedPrice,
                toggle
              }} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setFilterOpen(false)} className="w-full bg-brand-brown text-white font-primary text-xs font-semibold tracking-widest uppercase py-3">
                Show {filtered.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AllJewelleryCatalog() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <JewelryLoader size="lg" label="Preparing catalog..." />
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </PageLayout>
  );
}
