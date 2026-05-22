"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ShieldCheck, Truck, RotateCcw, Check, Lock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, products } from '@/lib/products';

export default function CartPage() {
  const { 
    cartItems, 
    isMounted, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    clearCart 
  } = useCart();

  const { user, isLoggedIn, addOrder, openAuthModal } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount }
  const [promoError, setPromoError] = useState('');
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPincode, setCheckoutPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // 1. Promo codes
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'WELCOME10') {
      const discount = Math.round(cartTotal * 0.10);
      setAppliedPromo({ code: 'WELCOME10', discount });
    } else if (code === 'MIPGOLD') {
      const discount = 1500;
      if (cartTotal < 10000) {
        setPromoError('MIPGOLD is only applicable on orders above ₹10,000');
      } else {
        setAppliedPromo({ code: 'MIPGOLD', discount });
      }
    } else {
      setPromoError('Invalid coupon code. Try WELCOME10 or MIPGOLD');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Calculations
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Load Razorpay script dynamically
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // Ignore if already removed
      }
    };
  }, []);

  // Auto-fill checkout fields if user is logged in
  React.useEffect(() => {
    if (isCheckoutOpen && isLoggedIn && user) {
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      setTimeout(() => {
        setCheckoutName(user.name || '');
        setCheckoutPhone(user.phone || '');
        setCheckoutEmail(user.email || '');
        setCheckoutAddress(defaultAddr ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state}` : '');
        setCheckoutPincode(defaultAddr?.pincode || '');
      }, 0);
    }
  }, [isCheckoutOpen, isLoggedIn, user]);

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      openAuthModal();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // 2. Checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingOrder(true);

    try {
      // Split the address field to populate street, city, state
      const addressParts = checkoutAddress.split(',');
      const city = addressParts[addressParts.length - 2]?.trim() || 'Banahatti';
      const state = addressParts[addressParts.length - 1]?.trim() || 'Karnataka';
      const street = addressParts.slice(0, addressParts.length - 2).join(',').trim() || checkoutAddress;

      const shippingAddress = {
        street,
        city,
        state,
        pincode: checkoutPincode
      };

      // Create Order on Backend
      const orderRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        alert(orderData.error || 'Failed to initialize order on the backend');
        setIsSubmittingOrder(false);
        return;
      }

      const { razorpayOrderId, orderId } = orderData;

      // In local dev/mock, or for COD, we can verify immediately
      if (paymentMethod === 'cod' || razorpayOrderId.startsWith('order_mock_') || !window.Razorpay) {
        // Complete mock/COD payment verification
        const verifyRes = await fetch('/api/v1/payments/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId,
            razorpayPaymentId: 'pay_mock_' + Math.floor(100000 + Math.random() * 900000),
            razorpaySignature: 'mock_sig_dev'
          })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          // Sync with Local Auth context orders
          const newOrder = {
            id: orderId,
            items: cartItems.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              weight: item.product.weight || '—',
              metal: item.product.metal || '—',
              image: item.product.image
            })),
            subtotal: cartTotal,
            discount: discountAmount,
            total: finalTotal,
            paymentMethod: paymentMethod
          };
          addOrder(newOrder);

          setGeneratedOrderId(orderId);
          setIsSubmittingOrder(false);
          setOrderSuccess(true);
          clearCart();
          setAppliedPromo(null);
        } else {
          alert(verifyData.error || 'Payment verification failed');
          setIsSubmittingOrder(false);
        }
      } else {
        // Razorpay payment integration logic
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MIP Jewellers',
          description: 'Secure Luxury Checkout',
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await fetch('/api/v1/payments/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                const newOrder = {
                  id: orderId,
                  items: cartItems.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    weight: item.product.weight || '—',
                    metal: item.product.metal || '—',
                    image: item.product.image
                  })),
                  subtotal: cartTotal,
                  discount: discountAmount,
                  total: finalTotal,
                  paymentMethod: paymentMethod
                };
                addOrder(newOrder);

                setGeneratedOrderId(orderId);
                setOrderSuccess(true);
                clearCart();
                setAppliedPromo(null);
              } else {
                alert(verifyData.error || 'Payment verification failed');
              }
            } catch (err) {
              console.error(err);
              alert('Error verifying payment');
            } finally {
              setIsSubmittingOrder(false);
            }
          },
          prefill: {
            name: checkoutName,
            email: checkoutEmail,
            contact: checkoutPhone
          },
          theme: {
            color: '#8c6239'
          },
          modal: {
            ondismiss: function () {
              setIsSubmittingOrder(false);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'Checkout failed');
      setIsSubmittingOrder(false);
    }
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    if (orderSuccess) {
      setOrderSuccess(false);
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutEmail('');
      setCheckoutAddress('');
      setCheckoutPincode('');
    }
  };

  // Cross-sell recommendations (limit to 3 rings or bestsellers)
  const recommendations = products
    .filter(p => p.tag === 'Bestseller' || p.tag === 'New')
    .slice(0, 3);

  if (!isMounted) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-bg-cream">
          <div className="w-8 h-8 border-3 border-brand-brown border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-bg-cream min-h-screen py-10 md:py-16 text-text-dark">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* Header Banner */}
          <div className="mb-10 text-center md:text-left">
            <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-2">
              Your Selection
            </span>
            <h1 className="font-secondary text-3xl md:text-5xl text-brand-brown tracking-wide">
              Shopping Cart
            </h1>
          </div>

          {cartItems.length === 0 && !orderSuccess ? (
            /* Empty Cart View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white border border-brand-gold/15 p-8 md:p-12 text-center shadow-xs">
                <div className="w-16 h-16 bg-bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-brand-gold" strokeWidth={1.5} />
                </div>
                <h2 className="font-secondary text-2xl text-brand-brown mb-3">Your Cart is Empty</h2>
                <p className="font-primary text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mb-8">
                  Browse our handpicked collections of pure 22KT gold necklaces, diamond rings, and masterwork earrings to start your selection.
                </p>
                <Link 
                  href="/collections"
                  className="inline-block bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white font-primary text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 transition-all duration-300 shadow-md"
                >
                  Browse Collections
                </Link>
              </div>

              {/* Sidebar Recommendations */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-brand-gold/15 p-6 shadow-xs">
                  <h3 className="font-secondary text-lg text-brand-brown mb-5 border-b border-gray-100 pb-3">
                    Bestsellers For You
                  </h3>
                  <div className="space-y-4">
                    {recommendations.map((p) => (
                      <Link key={p.id} href={`/products/${p.slug}`} className="flex gap-4 group">
                        <div className="relative w-16 h-16 bg-bg-cream overflow-hidden shrink-0 border border-gray-100">
                          <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="font-secondary text-xs text-brand-brown truncate group-hover:text-brand-gold transition-colors font-bold">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-primary tracking-wide mt-0.5">{p.metal} · {p.weight}</span>
                          <span className="text-xs text-brand-brown font-semibold mt-1">{formatPrice(p.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cart items */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white border border-brand-gold/15 p-4 md:p-6 shadow-xs">
                  <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-primary tracking-widest text-gray-400 uppercase font-bold">
                    <div className="col-span-6">Product Details</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 items-center">
                        
                        {/* Product info details */}
                        <div className="col-span-6 flex gap-4 items-center">
                          <div className="relative w-20 h-20 bg-bg-cream overflow-hidden border border-gray-100 shrink-0">
                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <Link href={`/products/${item.product.slug}`} className="font-secondary text-sm md:text-base text-brand-brown hover:text-brand-gold transition-colors block font-bold leading-snug">
                              {item.product.name}
                            </Link>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] font-primary text-gray-400">
                              <span><strong>Metal:</strong> {item.product.metal}</span>
                              <span>•</span>
                              <span><strong>Weight:</strong> {item.product.weight}</span>
                              {item.product.stone && (
                                <>
                                  <span>•</span>
                                  <span><strong>Stone:</strong> {item.product.stone}</span>
                                </>
                              )}
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="mt-3 flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors text-[10px] tracking-wider uppercase font-bold font-primary cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="col-span-2 text-left md:text-center">
                          <span className="md:hidden text-[10px] text-gray-400 font-primary block mb-0.5">Unit Price:</span>
                          <span className="font-primary text-xs md:text-sm text-gray-700 font-medium">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="col-span-2 flex justify-start md:justify-center">
                          <div className="flex items-center border border-gray-200 bg-white">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-brand-brown disabled:opacity-50"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 font-primary text-xs font-semibold text-brand-brown min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-brand-brown"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal Total price */}
                        <div className="col-span-2 text-left md:text-right">
                          <span className="md:hidden text-[10px] text-gray-400 font-primary block mb-0.5">Subtotal:</span>
                          <span className="font-secondary text-sm text-brand-brown font-bold">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>

                {/* Trust badges footer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: ShieldCheck, title: 'BIS 916 Hallmarked', desc: '100% Certified pure gold purity' },
                    { icon: Truck, title: 'Insured Delivery', desc: 'Free secure packaging and transport' },
                    { icon: RotateCcw, title: 'Lifetime Exchange', desc: 'Easy upgrade & trade-in value' }
                  ].map((badge, idx) => (
                    <div key={idx} className="bg-white border border-brand-gold/10 p-4 flex items-start gap-3 shadow-xs">
                      <badge.icon className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <h4 className="font-primary text-[11px] tracking-wider uppercase font-bold text-brand-brown mb-0.5">{badge.title}</h4>
                        <p className="font-primary text-[10px] text-gray-400 leading-normal">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column: Order Summary sticky */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-white border border-brand-gold/15 p-6 shadow-xs sticky top-36">
                  <h3 className="font-secondary text-lg text-brand-brown mb-5 border-b border-gray-100 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-3 font-primary text-xs border-b border-gray-100 pb-5 mb-5">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal ({cartItems.reduce((acc, cur) => acc + cur.quantity, 0)} Items)</span>
                      <span className="font-semibold text-gray-700">{formatPrice(cartTotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Shipping & Insurance</span>
                      <span className="text-emerald-600 font-medium tracking-wide uppercase text-[10px]">Free</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>BIS Hallmarking Fees</span>
                      <span className="text-emerald-600 font-medium tracking-wide uppercase text-[10px]">Included</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/50 p-2 border border-emerald-100/50">
                        <div className="flex items-center gap-1.5">
                          <span>Coupon <strong>{appliedPromo.code}</strong> applied</span>
                          <button onClick={handleRemovePromo} className="text-red-500 font-bold hover:text-red-700 transition-colors uppercase text-[9px] cursor-pointer">
                            [Remove]
                          </button>
                        </div>
                        <span>-{formatPrice(appliedPromo.discount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total price */}
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="font-secondary text-sm text-brand-brown">Estimated Total</span>
                    <span className="font-secondary text-2xl text-brand-brown font-bold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  {/* Promo Input */}
                  {!appliedPromo && (
                    <form onSubmit={handleApplyPromo} className="mb-6">
                      <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="e.g. WELCOME10"
                          className="flex-1 text-xs border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-brand-gold uppercase text-text-dark bg-bg-cream/20 font-primary"
                        />
                        <button
                          type="submit"
                          className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white transition-colors px-4 py-2.5 text-xs font-semibold tracking-wider font-primary uppercase cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{promoError}</p>}
                      <span className="text-[9px] text-gray-400 block mt-1.5 font-primary">Use <strong>WELCOME10</strong> (10% Off) or <strong>MIPGOLD</strong> (₹1,500 Off on orders above ₹10k)</span>
                    </form>
                  )}

                  {/* Checkout Button */}
                  <button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-4 font-primary text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> Proceed to Checkout
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* CHECKOUT FLOW SECURE DIALOG MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckoutModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full max-w-lg border border-brand-gold/20 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header Accent */}
              <div className="h-1.5 bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown" />

              <button
                onClick={closeCheckoutModal}
                className="absolute right-4 top-5 text-gray-400 hover:text-text-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8">
                {!orderSuccess ? (
                  <>
                    <div className="mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-brand-gold shrink-0" />
                      <div>
                        <span className="font-primary text-[9px] tracking-[0.25em] uppercase font-bold text-brand-gold block">Secure Order Portal</span>
                        <h3 className="font-secondary text-2xl text-brand-brown leading-tight">Complete Your Order</h3>
                      </div>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      
                      {/* Name */}
                      <div>
                        <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                        />
                      </div>

                      {/* Contact row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={checkoutPhone}
                            onChange={(e) => setCheckoutPhone(e.target.value)}
                            placeholder="Mobile number"
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={checkoutEmail}
                            onChange={(e) => setCheckoutEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                          />
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Delivery Address</label>
                        <textarea
                          required
                          rows={2.5}
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          placeholder="Complete shipping address..."
                          className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary resize-none"
                        />
                      </div>

                      {/* Pincode & Payment Method */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Pincode</label>
                          <input
                            type="text"
                            required
                            pattern="^[0-9]{6}$"
                            maxLength={6}
                            value={checkoutPincode}
                            onChange={(e) => setCheckoutPincode(e.target.value)}
                            placeholder="e.g. 587311"
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-white font-primary"
                          >
                            <option value="cod">Cash on Delivery (COD)</option>
                            <option value="card">Net Banking / Card / UPI</option>
                          </select>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingOrder}
                          className="w-full bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-4 font-primary text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                        >
                          {isSubmittingOrder ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Securing Order...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" /> Place Order ({formatPrice(finalTotal)})
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </>
                ) : (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 animate-bounce">
                      <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
                    </div>

                    <span className="font-primary text-[9px] tracking-[0.25em] uppercase font-bold text-emerald-600">Order Confirmed</span>
                    <h3 className="font-secondary text-2xl text-brand-brown mt-1">Thank You For Your Purchase!</h3>
                    
                    <div className="my-6 bg-bg-cream/60 p-4 border border-gray-100 space-y-2 text-xs text-left max-w-sm mx-auto">
                      <p className="text-gray-500"><strong className="text-brand-brown">Customer:</strong> {checkoutName}</p>
                      <p className="text-gray-500"><strong className="text-brand-brown">Delivery Type:</strong> Insured Shipping</p>
                      <p className="text-gray-500"><strong className="text-brand-brown">Address:</strong> {checkoutAddress}, {checkoutPincode}</p>
                      <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Order ID:</span>
                        <span className="font-mono text-brand-brown font-bold tracking-wider">{generatedOrderId}</span>
                      </div>
                    </div>

                    <p className="font-primary text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                      Your order has been recorded securely. An insured shipping confirmation containing packaging guidelines and invoice has been dispatched to {checkoutEmail}.
                    </p>

                    <button
                      onClick={closeCheckoutModal}
                      className="px-8 py-3.5 bg-brand-brown text-white hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-primary tracking-[0.18em] uppercase font-bold text-[10px] shadow-md cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageLayout>
  );
}
