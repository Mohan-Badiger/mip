"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  User, ShoppingBag, Heart, Trash2, Edit3, 
  Mail, CheckCircle2, Lock, 
  ChevronRight, LogOut, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';

function AccountDashboardContent() {
  const { 
    user, 
    isLoggedIn, 
    orders, 
    wishlist, 
    isMounted, 
    logout, 
    updateProfile, 
    toggleWishlist,
    openAuthModal
  } = useAuth();
  
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPincode, setEditPincode] = useState('');
  
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [addedItems, setAddedItems] = useState({}); // Track quick-add status for products: { [id]: boolean }

  // Sync tab from query parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'favourites'].includes(tabParam)) {
      setTimeout(() => {
        setActiveTab(tabParam);
      }, 0);
    }
  }, [searchParams]);

  // Set local state when editing is opened or user changes
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      setTimeout(() => {
        setEditName(user.name || '');
        setEditPhone(user.phone || '');
        setEditAddress(defaultAddr ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state}` : '');
        setEditPincode(defaultAddr?.pincode || '');
      }, 0);
    }
  }, [user, isEditingProfile]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    router.replace(`/account?tab=${tabName}`, { scroll: false });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
      pincode: editPincode
    });
    setIsEditingProfile(false);
    if (!result || result.success) {
      setProfileSuccessMsg('Profile details updated successfully.');
    } else {
      setProfileSuccessMsg(`Update failed: ${result.error}`);
    }
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const handleQuickAdd = (product) => {
    addToCart(product, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-bg-cream">
        <div className="w-8 h-8 border-3 border-brand-brown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guest view - Elegant Sign In Portal
  if (!isLoggedIn) {
    return (
      <div className="bg-bg-cream min-h-screen py-16 md:py-28 flex items-center justify-center">
        <div className="max-w-[480px] w-full mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-brand-gold/15 shadow-xl p-8 md:p-10 relative overflow-hidden text-center animate-fade-in"
          >
            <div className="h-1 bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown absolute top-0 left-0 right-0" />
            
            <div className="w-16 h-16 bg-bg-cream border border-brand-gold/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
            </div>

            <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-2">MIP Customer Portal</span>
            <h1 className="font-secondary text-2xl md:text-3xl text-brand-brown mb-3">Welcome to MIP</h1>
            <p className="font-primary text-xs text-gray-500 leading-relaxed mb-8">
              Sign in to view your bespoke orders, track active package deliveries, and access your curated wishlist of luxury jewellery pieces.
            </p>

            <button
              onClick={() => openAuthModal()}
              className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown py-4 font-primary text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer"
            >
              <Lock className="w-3.5 h-3.5" /> Sign In to Portal
            </button>

            <div className="mt-8 pt-5 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 block font-primary">
                New to MIP? Registration is quick and seamless during sign-in.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-cream min-h-screen py-8 md:py-16 text-text-dark">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Banner header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-brand-gold/10">
          <div>
            <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-2">
              Welcome Back
            </span>
            <h1 className="font-secondary text-3xl md:text-5xl text-brand-brown tracking-wide">
              {user.name}
            </h1>
            <p className="font-primary text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-brand-gold" /> {user.email}
            </p>
          </div>
          
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-1.5 font-primary text-[10px] font-bold tracking-widest text-red-500 hover:text-red-700 transition-colors uppercase border border-red-200/50 hover:bg-red-50/50 bg-white px-4 py-2.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Success toast notification */}
        <AnimatePresence>
          {profileSuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-4 py-3 flex items-center gap-2 font-primary font-medium"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              {profileSuccessMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Navigation Tabs */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', label: 'My Profile Details', icon: User },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: ShoppingBag },
              { id: 'favourites', label: `Favourites (${wishlist.length})`, icon: Heart }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between p-4 font-primary text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-brand-brown text-white shadow-md' 
                      : 'bg-white text-brand-brown hover:bg-bg-cream hover:text-brand-gold border border-brand-gold/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 ${isSelected ? 'text-brand-gold' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column Dashboard View Area */}
          <div className="lg:col-span-9">
            <div className="bg-white border border-brand-gold/15 p-6 md:p-8 shadow-xs min-h-[450px]">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                    <h2 className="font-secondary text-xl text-brand-brown">Account Details</h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-1.5 font-primary text-[10px] font-bold tracking-widest text-brand-gold hover:text-brand-brown transition-colors uppercase cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    /* Display Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold block mb-1">Full Name</span>
                          <p className="font-secondary text-base text-brand-brown font-semibold">{user.name}</p>
                        </div>
                        <div>
                          <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold block mb-1">Email Address</span>
                          <p className="font-primary text-sm text-gray-700">{user.email}</p>
                        </div>
                        <div>
                          <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold block mb-1">Mobile Phone</span>
                          <p className="font-primary text-sm text-gray-700">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold block mb-1">Primary Shipping Address</span>
                          <p className="font-primary text-sm text-gray-700 leading-relaxed">
                            {(() => {
                              const addr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
                              if (!addr) return 'Not provided';
                              return `${addr.street}, ${addr.city}, ${addr.state}`;
                            })()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold block mb-1">Pincode</span>
                          <p className="font-primary text-sm text-gray-700">
                            {(user.addresses?.find(a => a.isDefault) || user.addresses?.[0])?.pincode || 'Not provided'}
                          </p>
                        </div>
                        <div className="pt-2">
                          <span className="bg-bg-cream text-brand-gold text-[9px] tracking-widest uppercase font-bold px-2.5 py-1 inline-block">
                            Member Since 2026
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode Form */
                    <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                          />
                        </div>
                        
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Primary Shipping Address</label>
                        <textarea
                          required
                          rows={3}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Pincode</label>
                          <input
                            type="text"
                            required
                            pattern="^[0-9]{6}$"
                            maxLength={6}
                            value={editPincode}
                            onChange={(e) => setEditPincode(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-3 px-6 font-primary text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 py-3 px-6 font-primary text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="font-secondary text-xl text-brand-brown mb-6 pb-3 border-b border-gray-100">
                    Order History
                  </h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-secondary text-lg text-brand-brown mb-1">No Orders Found</h3>
                      <p className="font-primary text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                        You have not placed any orders yet. Add beautiful items to your shopping cart to begin.
                      </p>
                      <Link
                        href="/collections"
                        className="inline-block bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white font-primary text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition-colors shadow-xs"
                      >
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const statusColors = {
                          Pending: 'bg-amber-50 text-amber-800 border-amber-100/50',
                          Shipped: 'bg-blue-50 text-blue-800 border-blue-100/50',
                          Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-100/50',
                        };
                        const badgeStyle = statusColors[order.status] || 'bg-gray-50 text-gray-800 border-gray-100/50';

                        return (
                          <div key={order.id} className="border border-brand-gold/15 bg-white overflow-hidden shadow-xs">
                            {/* Order Card Header */}
                            <div className="bg-bg-cream/40 p-4 border-b border-brand-gold/10 flex flex-wrap justify-between items-center gap-4 text-xs">
                              <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <div>
                                  <span className="text-[9px] text-gray-400 font-primary block uppercase font-bold">Order ID</span>
                                  <span className="font-mono font-bold text-brand-brown">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-400 font-primary block uppercase font-bold">Placed On</span>
                                  <span className="font-primary text-gray-700 font-medium">{order.date}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-gray-400 font-primary block uppercase font-bold">Payment Method</span>
                                  <span className="font-primary text-gray-700 font-semibold uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full font-primary text-[9px] font-bold uppercase border ${badgeStyle}`}>
                                  {order.status}
                                </span>
                                <div className="text-right">
                                  <span className="text-[9px] text-gray-400 font-primary block uppercase font-bold">Grand Total</span>
                                  <span className="font-secondary text-sm text-brand-brown font-bold">{formatPrice(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Order items inside card */}
                            <div className="p-4 divide-y divide-gray-100">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                                  <div className="relative w-14 h-14 bg-bg-cream overflow-hidden border border-gray-100 shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-secondary text-sm text-brand-brown font-bold truncate leading-snug">
                                      {item.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 text-[10px] font-primary text-gray-400">
                                      <span><strong>Metal:</strong> {item.metal}</span>
                                      <span>•</span>
                                      <span><strong>Weight:</strong> {item.weight}</span>
                                      <span>•</span>
                                      <span><strong>Qty:</strong> {item.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-secondary text-xs text-brand-brown font-bold">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* FAVOURITES TAB */}
              {activeTab === 'favourites' && (
                <div>
                  <h2 className="font-secondary text-xl text-brand-brown mb-6 pb-3 border-b border-gray-100">
                    My Curated Favourites
                  </h2>
                  
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-secondary text-lg text-brand-brown mb-1">Your Favourites List is Empty</h3>
                      <p className="font-primary text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                        Explore our jewellery collections and click the Heart icon on any product page to curate your favourites list here.
                      </p>
                      <Link
                        href="/collections"
                        className="inline-block bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white font-primary text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition-colors shadow-xs"
                      >
                        Explore Collections
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => {
                        const isAdded = addedItems[item.id] || false;
                        return (
                          <div 
                            key={item.id}
                            className="group bg-white border border-brand-gold/15 relative overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                          >
                            {/* Remove button top right */}
                            <button
                              onClick={() => toggleWishlist(item)}
                              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center shadow-xs cursor-pointer border border-gray-100"
                              aria-label="Remove from Favourites"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Product Image */}
                            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden shrink-0">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-[1.4s]" 
                              />
                            </div>

                            {/* Product Info */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div className="mb-4">
                                <span className="font-primary text-[8px] tracking-[0.2em] uppercase text-brand-gold font-bold block mb-1">
                                  {item.metal}
                                </span>
                                <Link 
                                  href={`/products/${item.slug}`}
                                  className="font-secondary text-sm text-brand-brown hover:text-brand-gold transition-colors font-bold block leading-snug"
                                >
                                  {item.name}
                                </Link>
                                <span className="text-[10px] text-gray-400 font-primary tracking-wide mt-1 block">Weight: {item.weight}</span>
                                <span className="font-secondary text-sm text-brand-brown font-semibold block mt-1.5">{formatPrice(item.price)}</span>
                              </div>

                              <button
                                onClick={() => handleQuickAdd(item)}
                                disabled={isAdded}
                                className={`w-full font-primary text-[10px] font-bold tracking-[0.18em] uppercase py-2.5 flex items-center justify-center gap-1.5 transition-all duration-300 border cursor-pointer ${
                                  isAdded 
                                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                                    : 'bg-brand-brown border-brand-brown hover:bg-brand-gold hover:border-brand-gold hover:text-brand-brown text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" /> Added
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh] bg-bg-cream">
          <div className="w-8 h-8 border-3 border-brand-brown border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AccountDashboardContent />
      </Suspense>
    </PageLayout>
  );
}
