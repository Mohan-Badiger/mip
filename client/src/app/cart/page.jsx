/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity */
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import {
  Trash2, Plus, Minus, ShoppingBag,
  ShieldCheck, Truck, RotateCcw, Check, Lock, X, Heart, ChevronDown,
  ChevronRight, CreditCard, MapPin, User as UserIcon, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
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

  const { user, isLoggedIn, addOrder, openAuthModal, toggleWishlist, isWishlisted, updateProfile } = useAuth();
  const { settings } = useSettings();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount }
  const [promoError, setPromoError] = useState('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Contact, 2 = Shipping, 3 = Payment & Review
  const [addressMode, setAddressMode] = useState('saved'); // 'saved' or 'new'
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState(''); // acts as street address line
  const [checkoutArea, setCheckoutArea] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [checkoutState, setCheckoutState] = useState('');
  const [checkoutCountry, setCheckoutCountry] = useState('India');
  const [checkoutPincode, setCheckoutPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saveAddressChecked, setSaveAddressChecked] = useState(true);
  const [activeRazorpayOrderId, setActiveRazorpayOrderId] = useState('');
  const [activeOrderId, setActiveOrderId] = useState('');

  React.useEffect(() => {
    if (isMounted && !settings.codAllowed && paymentMethod === 'cod') {
      setPaymentMethod('card');
    }
  }, [isMounted, settings.codAllowed, paymentMethod]);

  // Handle Quick Checkout / Buy Now query parameter
  React.useEffect(() => {
    if (isMounted) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('checkout') === 'true') {
        if (!isLoggedIn) {
          openAuthModal();
        } else {
          setIsCheckoutOpen(true);
        }
        // Clean up url parameter
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [isMounted, isLoggedIn]);


  // Dynamic Applicable Coupons list
  const [applicableCoupons, setApplicapleCoupons] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);

  React.useEffect(() => {
    async function fetchApplicable() {
      try {
        const res = await fetch('/api/v1/coupons/applicable');
        const data = await res.json();
        if (data.success) {
          setApplicapleCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
      }
    }
    if (isMounted) {
      fetchApplicable();
    }
  }, [isMounted, isLoggedIn, user]);

  // 1. Promo codes
  const applyPromoCode = async (codeStr) => {
    setPromoError('');
    const code = codeStr.trim().toUpperCase();

    if (!code) {
      setPromoError('Please enter a coupon code.');
      return;
    }

    if (!isLoggedIn) {
      setPromoError('Please log in to apply promo codes.');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await fetch('/api/v1/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedPromo({
          code: data.coupon.code,
          discount: data.coupon.discount
        });
      } else {
        setPromoError(data.error || 'Failed to apply coupon.');
      }
    } catch (err) {
      console.error(err);
      setPromoError('Network error validation promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    await applyPromoCode(promoCode);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Calculations
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const shippingFee = cartTotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
  const insuranceFee = settings.insuranceFee || 0;
  const codHandlingFee = (paymentMethod === 'cod' && settings.codAllowed) ? settings.codExtraCharge : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee + insuranceFee + codHandlingFee);

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
      setCheckoutName(user.name || '');
      setCheckoutPhone(user.phone || '');
      setCheckoutEmail(user.email || '');

      if (user.addresses && user.addresses.length > 0) {
        setAddressMode('saved');
        const defaultIdx = user.addresses.findIndex(a => a.isDefault);
        const activeIdx = defaultIdx !== -1 ? defaultIdx : 0;
        setSelectedAddressIndex(activeIdx);

        const activeAddr = user.addresses[activeIdx];
        setCheckoutAddress(activeAddr.street || '');
        setCheckoutArea(activeAddr.area || '');
        setCheckoutCity(activeAddr.city || '');
        setCheckoutState(activeAddr.state || '');
        setCheckoutCountry(activeAddr.country || 'India');
        setCheckoutPincode(activeAddr.pincode || '');
      } else {
        setAddressMode('new');
        setCheckoutAddress('');
        setCheckoutArea('');
        setCheckoutCity('');
        setCheckoutState('');
        setCheckoutCountry('India');
        setCheckoutPincode('');
      }
      setAcceptTerms(false);
      setIsPaymentDropdownOpen(false);
      setCheckoutStep(1);
    }
  }, [isCheckoutOpen, isLoggedIn, user]);

  // Lock body scroll when checkout modal is open
  React.useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  const handleSelectAddress = (index) => {
    setSelectedAddressIndex(index);
    const addr = user.addresses[index];
    if (addr) {
      setCheckoutAddress(addr.street || '');
      setCheckoutArea(addr.area || '');
      setCheckoutCity(addr.city || '');
      setCheckoutState(addr.state || '');
      setCheckoutCountry(addr.country || 'India');
      setCheckoutPincode(addr.pincode || '');
    }
  };


  const validateStep1 = () => {
    setValidationError('');
    if (!checkoutName.trim()) {
      setValidationError('Please enter your full name.');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(checkoutPhone.trim())) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkoutEmail.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setValidationError('');
    if (!checkoutAddress.trim()) {
      setValidationError('Please enter your house/flat number and building.');
      return false;
    }
    if (addressMode === 'new' && !checkoutArea.trim()) {
      setValidationError('Please enter your street address or area details.');
      return false;
    }
    if (!checkoutCity.trim()) {
      setValidationError('Please enter your city.');
      return false;
    }
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(checkoutPincode.trim())) {
      setValidationError('Please enter a valid 6-digit pincode.');
      return false;
    }
    if (!checkoutState.trim()) {
      setValidationError('Please enter your state.');
      return false;
    }
    if (!checkoutCountry.trim()) {
      setValidationError('Please enter your country.');
      return false;
    }
    return true;
  };

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      openAuthModal();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const saveAddressIfChecked = async () => {
    if (addressMode === 'new' && saveAddressChecked && isLoggedIn) {
      try {
        await updateProfile({
          primaryAddress: {
            street: checkoutArea ? `${checkoutAddress}, ${checkoutArea}` : checkoutAddress,
            city: checkoutCity,
            state: checkoutState,
            pincode: checkoutPincode,
            country: checkoutCountry
          }
        });
      } catch (err) {
        console.error("Failed to auto-save address:", err);
      }
    }
  };

  // 2. Checkout
  const handleCheckoutSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Final security check for validation
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    if (!acceptTerms) {
      setValidationError(`Please accept the ${settings.brandName} Terms of Service and Privacy Policy to proceed.`);
      setIsSubmittingOrder(false);
      return;
    }
    setIsSubmittingOrder(true);

    try {
      const shippingAddress = {
        street: checkoutAddress,
        area: checkoutArea,
        city: checkoutCity,
        state: checkoutState,
        country: checkoutCountry,
        pincode: checkoutPincode
      };

      // Create Order on Backend
      const orderRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress, paymentMethod })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        alert(orderData.error || 'Failed to initialize order on the backend');
        setIsSubmittingOrder(false);
        return;
      }

      const { razorpayOrderId, orderId } = orderData;
      setActiveRazorpayOrderId(razorpayOrderId);
      setActiveOrderId(orderId);

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

          // Auto-save address if checkbox is checked
          await saveAddressIfChecked();

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
          name: settings.brandName,
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

                // Auto-save address if checkbox is checked
                await saveAddressIfChecked();

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
    setValidationError('');
    setCheckoutStep(1);
    if (orderSuccess) {
      setOrderSuccess(false);
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutEmail('');
      setCheckoutAddress('');
      setCheckoutArea('');
      setCheckoutCity('');
      setCheckoutState('');
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
        <div className="max-w-350 mx-auto px-4 md:px-8">

          {/* Header Banner */}
          <div className="mb-10 text-center md:text-left">
            <span className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold font-semibold block mb-2">
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
                <div className="bg-white border border-gray-100 p-6 md:p-8">
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => {
                      const priceVal = item.product.price;
                      const discountRate = 0.0354; // ~3.54% discount
                      const originalPrice = Math.round(priceVal * (1 + discountRate));
                      const savingsVal = originalPrice - priceVal;

                      // Calculate dynamic delivery date: current date + 5 days
                      const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      const rawWeight = item.product.weight || '1.810 g';
                      const metalWeightVal = parseFloat(rawWeight) || 1.810;
                      const grossWeightVal = metalWeightVal + 0.06; // slight addition for gross weight

                      return (
                        <div key={item.product.id} className="relative flex flex-col sm:flex-row gap-6 py-8 border-b border-gray-100 last:border-b-0 items-start group">

                          {/* Absolute Remove Button for Modern Clean Luxury Look */}
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="absolute top-8 right-0 p-1.5 text-gray-400 hover:text-red-650 transition-colors cursor-pointer hover:scale-105"
                            aria-label="Remove item"
                          >
                            <X className="w-5 h-5 stroke-[1.5]" />
                          </button>

                          {/* Product Image */}
                          <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-bg-cream/40 overflow-hidden border border-gray-100 shrink-0 shadow-3xs">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover hover:scale-[1.02] transition-transform duration-500"
                            />
                          </div>

                          {/* Detail & Price Grid */}
                          <div className="flex-1 flex flex-col justify-between min-h-32 w-full pr-8">

                            {/* Product Info */}
                            <div className="space-y-2">
                              {/* SKU Code directly shown without "Item Code:" label */}
                              <span className="font-mono text-xs tracking-wider text-gray-500 block">
                                {item.product.sku || '41363440'}
                              </span>

                              {item.product.isUnavailable ? (
                                <span className="font-secondary text-base md:text-lg text-rose-600 block font-semibold leading-snug">
                                  {item.product.name}
                                </span>
                              ) : (
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="font-secondary text-base md:text-lg text-brand-brown hover:text-brand-gold transition-colors block font-semibold leading-snug"
                                >
                                  {item.product.name}
                                </Link>
                              )}

                              {/* Specifications Row - Made fonts slightly larger/clearer & modern layout */}
                              {!item.product.isUnavailable && (
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-primary text-gray-650">
                                  <span>Purity: <strong className="text-brand-brown font-semibold">{item.product.metal?.split(' ')[0] || '22 KT'}</strong></span>
                                  <span className="text-gray-300">•</span>
                                  <span>Metal weight: <strong className="text-brand-brown font-semibold">{metalWeightVal.toFixed(3)} g</strong></span>
                                  <span className="text-gray-300">•</span>
                                  <span>Gross weight: <strong className="text-brand-brown font-semibold">{grossWeightVal.toFixed(3)} g</strong></span>
                                </div>
                              )}

                              {/* Delivery Indicator - Clean and clear */}
                              {item.product.isUnavailable ? (
                                <p className="text-xs text-rose-600 font-primary tracking-wide flex items-center gap-1.5 pt-1 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  Item not available
                                </p>
                              ) : (
                                <p className="text-xs text-emerald-800 font-primary tracking-wide flex items-center gap-1.5 pt-1 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Delivery by <span className="font-semibold">{deliveryDate}</span>
                                </p>
                              )}
                            </div>

                            {/* Bottom row: Action Buttons (Favourite only, since Remove is at top right) and Price & Quantity */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-50">

                              {/* Favourite Button */}
                              <button
                                onClick={() => toggleWishlist(item.product)}
                                className="flex items-center gap-2 text-gray-650 hover:text-brand-gold transition-colors text-xs tracking-wide uppercase font-semibold font-primary cursor-pointer w-fit"
                              >
                                <Heart className={`w-4 h-4 ${isWishlisted(item.product.id) ? 'fill-brand-gold text-brand-gold' : 'text-gray-400'}`} />
                                <span>{isWishlisted(item.product.id) ? 'Wishlisted' : 'Favourite'}</span>
                              </button>

                              {/* Pricing & Quantity Stack */}
                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">

                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-200 bg-white">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-2 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-brand-brown disabled:opacity-50"
                                    disabled={item.quantity <= 1 || item.product.isUnavailable}
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-3.5 font-primary text-xs font-semibold text-brand-brown min-w-6 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="p-2 hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-brand-brown disabled:opacity-50"
                                    disabled={item.product.isUnavailable}
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Price tags stack: unboxed, clean, and highly legible */}
                                <div className="text-right flex flex-col items-end">
                                  {item.product.isUnavailable ? (
                                    <span className="font-secondary text-sm md:text-base text-rose-650 font-bold leading-none tracking-wide">
                                      Unavailable
                                    </span>
                                  ) : (
                                    <>
                                      <div className="flex items-baseline gap-2">
                                        {originalPrice > priceVal && (
                                          <span className="text-xs text-gray-400 line-through font-primary tracking-wide">
                                            {formatPrice(originalPrice * item.quantity)}
                                          </span>
                                        )}
                                        <span className="font-secondary text-base md:text-lg text-brand-brown font-bold leading-none tracking-wide">
                                          {formatPrice(priceVal * item.quantity)}
                                        </span>
                                      </div>
                                      {originalPrice > priceVal && (
                                        <span className="text-xs font-semibold text-emerald-700 tracking-wide font-primary mt-1 block">
                                          Save {formatPrice(savingsVal * item.quantity)}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    })}
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
                      <span>Shipping {shippingFee === 0 ? '(Free)' : ''}</span>
                      <span className={shippingFee === 0 ? "text-emerald-600 font-medium tracking-wide uppercase text-[10px]" : "font-semibold text-gray-700"}>
                        {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                      </span>
                    </div>

                    {insuranceFee > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Transit Insurance</span>
                        <span className="font-semibold text-gray-700">{formatPrice(insuranceFee)}</span>
                      </div>
                    )}

                    {codHandlingFee > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>COD Convenience Fee</span>
                        <span className="font-semibold text-gray-700">{formatPrice(codHandlingFee)}</span>
                      </div>
                    )}

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
                          placeholder="ENTER PROMO CODE"
                          className="flex-1 text-xs border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-brand-gold uppercase text-text-dark bg-bg-cream/20 font-primary"
                        />
                        <button
                          type="submit"
                          disabled={promoLoading}
                          className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white transition-colors px-4 py-2.5 text-xs font-semibold tracking-wider font-primary uppercase cursor-pointer disabled:opacity-50"
                        >
                          {promoLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{promoError}</p>}
                      
                      {/* Dynamic Available Promos */}
                      {applicableCoupons.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[9px] tracking-wider text-brand-gold uppercase font-bold block">Available Coupons:</span>
                          <div className="grid gap-1">
                            {applicableCoupons.map((coupon) => (
                              <button
                                key={coupon._id}
                                type="button"
                                onClick={async () => {
                                  setPromoCode(coupon.code);
                                  await applyPromoCode(coupon.code);
                                }}
                                className="text-left text-[11px] p-1.5 border border-dashed border-brand-gold/20 hover:border-brand-gold/60 bg-bg-cream/30 hover:bg-bg-cream/50 transition-colors cursor-pointer group flex justify-between items-start"
                              >
                                <div>
                                  <span className="font-mono font-bold text-brand-brown group-hover:text-brand-gold">{coupon.code}</span>
                                  {coupon.firstTimeOnly && (
                                    <span className="ml-1.5 px-1 bg-amber-50 text-amber-700 text-[8px] font-bold rounded">New User</span>
                                  )}
                                  <p className="text-[9px] text-gray-400 font-primary mt-0.5">{coupon.description}</p>
                                </div>
                                <span className="font-semibold text-brand-brown text-[10px]">
                                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={cartItems.some(item => item.product.isUnavailable)}
                    className="w-full bg-brand-brown hover:bg-brand-gold hover:text-brand-brown disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-4 font-primary text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> {cartItems.some(item => item.product.isUnavailable) ? "Remove Unavailable Items" : "Proceed to Checkout"}
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
          <div className="fixed inset-0 z-100 overflow-y-auto flex items-start justify-center p-4 md:p-10 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckoutModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl -z-10"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="bg-white w-full max-w-2xl border border-brand-gold/30 shadow-2xl relative z-10 overflow-hidden my-auto rounded-sm"
            >
              {/* Header Gold Gradient Accent */}
              <div className="h-1.5 bg-linear-to-r from-brand-brown via-brand-gold to-brand-brown" />

              {/* Backdrop Blur Overlay when submitting to Razorpay */}
              <AnimatePresence>
                {isSubmittingOrder && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin mb-4" />
                    <span className="font-primary text-[10px] tracking-[0.25em] uppercase font-bold text-brand-brown">Securing Transaction...</span>
                    <p className="font-primary text-[11px] text-gray-400 mt-1.5 max-w-70 leading-relaxed mb-5">
                      Please complete the payment process in the secure Razorpay overlay.
                    </p>

                    {/* Test mode bypass with dummy transition */}
                    {(process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_test_')) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const verifyRes = await fetch('/api/v1/payments/verify-payment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                razorpayOrderId: activeRazorpayOrderId,
                                razorpayPaymentId: 'pay_mock_' + Math.floor(100000 + Math.random() * 900000),
                                razorpaySignature: 'mock_sig_dev'
                              })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyRes.ok && verifyData.success) {
                              const newOrder = {
                                id: activeOrderId,
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
                              await saveAddressIfChecked();
                              setGeneratedOrderId(activeOrderId);
                              setOrderSuccess(true);
                              clearCart();
                              setAppliedPromo(null);
                            } else {
                              alert(verifyData.error || 'Mock verification failed');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Error verifying mock payment');
                          } finally {
                            setIsSubmittingOrder(false);
                          }
                        }}
                        className="px-5 py-3 border border-brand-gold hover:bg-brand-gold hover:text-brand-brown text-brand-gold font-primary text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md cursor-pointer rounded-xs"
                      >
                        Bypass with Dummy Payment
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button */}
              <button
                onClick={closeCheckoutModal}
                className="absolute right-4 top-5 text-gray-400 hover:text-brand-gold hover:scale-105 transition-all cursor-pointer z-20"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-10">
                {!orderSuccess ? (
                  <>
                    {/* Secure Order Portal Header */}
                    <div className="mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/5 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <span className="font-primary text-[9px] tracking-[0.25em] uppercase font-bold text-brand-gold block leading-none mb-1">
                          Secure Order Portal
                        </span>
                        <h3 className="font-secondary text-2xl text-brand-brown leading-none">
                          Checkout
                        </h3>
                      </div>
                    </div>

                    {/* Step Stepper Indicator */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between max-w-md mx-auto relative px-2">
                        {/* Background connection line */}
                        <div className="absolute top-4.5 left-6 right-6 h-0.5 bg-gray-100 z-0">
                          <div
                            className="h-full bg-brand-gold transition-all duration-500"
                            style={{ width: checkoutStep === 1 ? '0%' : checkoutStep === 2 ? '50%' : '100%' }}
                          />
                        </div>

                        {[
                          { step: 1, label: 'Customer', icon: UserIcon },
                          { step: 2, label: 'Shipping', icon: MapPin },
                          { step: 3, label: 'Payment', icon: CreditCard }
                        ].map((item) => {
                          const Icon = item.icon;
                          const isActive = checkoutStep === item.step;
                          const isCompleted = checkoutStep > item.step;
                          return (
                            <div key={item.step} className="flex flex-col items-center z-10 relative">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300
                                ${isCompleted
                                  ? 'bg-brand-brown border-brand-brown text-white shadow-sm'
                                  : isActive
                                    ? 'bg-white border-brand-gold text-brand-gold shadow-md shadow-brand-gold/15 ring-4 ring-brand-gold/10'
                                    : 'bg-white border-gray-200 text-gray-400'}`}
                              >
                                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4.5 h-4.5" />}
                              </div>
                              <span className={`text-[9px] uppercase tracking-[0.2em] font-bold mt-2.5 transition-colors duration-300
                                ${isActive ? 'text-brand-brown font-bold' : 'text-gray-400'}`}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Validation Error Message Box */}
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50/70 border-l-2 border-red-500 text-red-700 text-xs font-primary mb-6 flex items-start gap-2.5 rounded-xs"
                      >
                        <span className="font-bold uppercase tracking-wider shrink-0 mt-0.5">[!] Error:</span>
                        <span className="font-medium leading-relaxed">{validationError}</span>
                      </motion.div>
                    )}

                    {/* Step Contents */}
                    <div className="min-h-70">
                      {checkoutStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">Full Name</label>
                            <input
                              type="text"
                              value={checkoutName}
                              onChange={(e) => {
                                setCheckoutName(e.target.value);
                                if (validationError) setValidationError('');
                              }}
                              placeholder="Enter your full name"
                              className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary tracking-wide transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">Phone Number</label>
                              <input
                                type="tel"
                                value={checkoutPhone}
                                onChange={(e) => {
                                  setCheckoutPhone(e.target.value);
                                  if (validationError) setValidationError('');
                                }}
                                placeholder="10-digit mobile number"
                                className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary tracking-wide transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">Email Address</label>
                              <input
                                type="email"
                                value={checkoutEmail}
                                onChange={(e) => {
                                  setCheckoutEmail(e.target.value);
                                  if (validationError) setValidationError('');
                                }}
                                placeholder="yourname@domain.com"
                                className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary tracking-wide transition-all"
                              />
                            </div>
                          </div>

                          <div className="pt-8">
                            <button
                              type="button"
                              onClick={() => {
                                if (validateStep1()) {
                                  setCheckoutStep(2);
                                }
                              }}
                              className="w-full bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-4 font-primary text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Continue to Shipping <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {checkoutStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="space-y-5"
                        >
                          {/* Saved Addresses Section (if they exist) */}
                          {user?.addresses && user.addresses.length > 0 && (
                            <div className="mb-2">
                              <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-2">
                                Ship to a Saved Address
                              </label>
                              <div className="flex gap-3 overflow-x-auto pb-2.5 scrollbar-thin select-none">
                                {user.addresses.map((addr, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setAddressMode('saved');
                                      handleSelectAddress(idx);
                                      setValidationError('');
                                    }}
                                    className={`p-3.5 border cursor-pointer relative transition-all duration-300 rounded-sm flex flex-col justify-between min-w-57.5 max-w-62.5 shrink-0
                                      ${addressMode === 'saved' && selectedAddressIndex === idx
                                        ? 'border-brand-gold bg-bg-cream/20 shadow-sm ring-1 ring-brand-gold/15'
                                        : 'border-gray-205 border-gray-200 hover:border-gray-300 bg-white'}`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${addressMode === 'saved' && selectedAddressIndex === idx ? 'text-brand-gold' : 'text-gray-400'}`} />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="text-[8px] tracking-wider font-bold text-brand-gold uppercase bg-brand-gold/5 px-1.5 py-0.5 rounded-sm">
                                            {addr.isDefault ? 'Default' : `#${idx + 1}`}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-brand-brown font-semibold truncate leading-tight">
                                          {addr.street}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                          {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                      </div>
                                    </div>
                                    {addressMode === 'saved' && selectedAddressIndex === idx && (
                                      <div className="absolute top-2.5 right-2.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold fill-brand-gold/5" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Address Form Fields */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                              <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold">
                                {addressMode === 'saved' ? 'Selected Address Details' : 'Enter Shipping Address'}
                              </label>
                              {addressMode === 'saved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddressMode('new');
                                    setCheckoutAddress('');
                                    setCheckoutArea('');
                                    setCheckoutCity('');
                                    setCheckoutState('');
                                    setCheckoutPincode('');
                                  }}
                                  className="text-[9px] text-brand-gold hover:underline uppercase font-bold tracking-wider cursor-pointer"
                                >
                                  + Ship to a New Address
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">House, Flat, Apartment, Building No.</label>
                              <input
                                type="text"
                                value={checkoutAddress}
                                onChange={(e) => {
                                  setCheckoutAddress(e.target.value);
                                  setAddressMode('new'); // switch to new mode if user edits
                                  if (validationError) setValidationError('');
                                }}
                                placeholder="e.g. Penthouse A, Floor 14"
                                className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Street Address, Landmark, Area</label>
                              <input
                                type="text"
                                value={checkoutArea}
                                onChange={(e) => {
                                  setCheckoutArea(e.target.value);
                                  setAddressMode('new'); // switch to new mode if user edits
                                  if (validationError) setValidationError('');
                                }}
                                placeholder="e.g. Mg Road, Opposite Royal Plaza"
                                className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">City</label>
                                <input
                                  type="text"
                                  value={checkoutCity}
                                  onChange={(e) => {
                                    setCheckoutCity(e.target.value);
                                    setAddressMode('new'); // switch to new mode
                                    if (validationError) setValidationError('');
                                  }}
                                  placeholder="e.g. Bangalore"
                                  className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Pincode</label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={checkoutPincode}
                                  onChange={(e) => {
                                    setCheckoutPincode(e.target.value);
                                    setAddressMode('new'); // switch to new mode
                                    if (validationError) setValidationError('');
                                  }}
                                  placeholder="6 digit PIN code"
                                  className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">State</label>
                                <input
                                  type="text"
                                  value={checkoutState}
                                  onChange={(e) => {
                                    setCheckoutState(e.target.value);
                                    setAddressMode('new'); // switch to new mode
                                    if (validationError) setValidationError('');
                                  }}
                                  placeholder="e.g. Karnataka"
                                  className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Country</label>
                                <input
                                  type="text"
                                  value={checkoutCountry}
                                  onChange={(e) => {
                                    setCheckoutCountry(e.target.value);
                                    setAddressMode('new'); // switch to new mode
                                    if (validationError) setValidationError('');
                                  }}
                                  placeholder="e.g. India"
                                  className="w-full text-xs px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/10 font-primary"
                                />
                              </div>
                            </div>

                            {/* Checkbox to Save Address for logged in users */}
                            {isLoggedIn && addressMode === 'new' && (
                              <div className="pt-2 flex items-start gap-2.5 select-none animate-fadeIn">
                                <div className="flex items-center h-5">
                                  <button
                                    type="button"
                                    onClick={() => setSaveAddressChecked(!saveAddressChecked)}
                                    className={`w-4 h-4 border rounded-xs transition-all flex items-center justify-center cursor-pointer
                                      ${saveAddressChecked
                                        ? 'bg-brand-brown border-brand-brown text-white'
                                        : 'bg-white border-gray-300 hover:border-brand-gold'}`}
                                  >
                                    {saveAddressChecked && <Check className="w-2.5 h-2.5 stroke-3" />}
                                  </button>
                                </div>
                                <label
                                  onClick={() => setSaveAddressChecked(!saveAddressChecked)}
                                  className="text-[10px] text-gray-550 font-primary cursor-pointer leading-tight select-none pt-0.5"
                                >
                                  Save this address to my profile for future purchases
                                </label>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setValidationError('');
                                setCheckoutStep(1);
                              }}
                              className="border border-brand-brown hover:border-brand-gold text-brand-brown hover:text-brand-gold py-4 font-primary text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
                            >
                              <ChevronLeft className="w-4 h-4" /> Go Back
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (validateStep2()) {
                                  setCheckoutStep(3);
                                }
                              }}
                              className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-4 font-primary text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
                            >
                              Continue <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {checkoutStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="space-y-6"
                        >
                          {/* Order items inline review panel */}
                          <div className="bg-bg-cream/20 p-4 border border-brand-gold/15 rounded-xs">
                            <span className="text-[9px] tracking-[0.2em] font-bold text-brand-gold uppercase block mb-3 border-b border-brand-gold/10 pb-1.5">
                              Review Selection ({cartItems.reduce((acc, cur) => acc + cur.quantity, 0)} Items)
                            </span>
                            <div className="max-h-28 overflow-y-auto space-y-3 pr-1">
                              {cartItems.map((item) => (
                                <div key={item.product.id} className="flex gap-3 items-center">
                                  <div className="relative w-10 h-10 bg-white border border-gray-100 shrink-0">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-secondary text-xs text-brand-brown font-semibold truncate leading-tight">{item.product.name}</h5>
                                    <span className="text-[9px] text-gray-400 font-primary block mt-0.5">{item.product.metal} · Qty {item.quantity}</span>
                                  </div>
                                  <span className="text-xs text-brand-brown font-bold shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Summary Price list details */}
                            <div className="border-t border-brand-gold/10 mt-3 pt-3 space-y-1.5 text-xs text-gray-500 font-primary">
                              <div className="flex justify-between">
                                <span>Cart Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                              </div>
                              {appliedPromo && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                  <span>Coupon Discount ({appliedPromo.code})</span>
                                  <span>-{formatPrice(appliedPromo.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Shipping {shippingFee === 0 ? '(Free)' : ''}</span>
                                <span className={shippingFee === 0 ? "text-emerald-650 font-medium text-[11px]" : ""}>
                                  {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                                </span>
                              </div>
                              {insuranceFee > 0 && (
                                <div className="flex justify-between">
                                  <span>Transit Insurance</span>
                                  <span>{formatPrice(insuranceFee)}</span>
                                </div>
                              )}
                              {codHandlingFee > 0 && (
                                <div className="flex justify-between">
                                  <span>COD Convenience Fee</span>
                                  <span>{formatPrice(codHandlingFee)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-brand-brown text-sm pt-2 border-t border-dashed border-brand-gold/15">
                                <span>Grand Total</span>
                                <span>{formatPrice(finalTotal)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Gateway payment selection buttons */}
                          <div>
                            <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-3">Select Payment Method</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Razorpay Online */}
                              <div
                                onClick={() => setPaymentMethod('card')}
                                className={`p-4 border cursor-pointer flex items-start gap-3 transition-all duration-350 rounded-sm relative
                                  ${paymentMethod === 'card'
                                    ? 'border-brand-gold bg-bg-cream/10 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                              >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all
                                  ${paymentMethod === 'card' ? 'border-brand-gold text-brand-gold' : 'border-gray-300'}`}
                                >
                                  {paymentMethod === 'card' && (
                                    <span className="w-2 h-2 rounded-full bg-brand-gold" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-bold text-brand-brown block leading-tight mb-1">Online Payment</span>
                                  <p className="text-[10px] text-gray-400 font-primary leading-normal">Net Banking, Cards, UPI, Wallets via Razorpay</p>
                                </div>
                              </div>

                              {/* Cash on Delivery */}
                              {settings.codAllowed ? (
                                <div
                                  onClick={() => {
                                    const baseEstTotal = Math.max(0, cartTotal - discountAmount + shippingFee + insuranceFee);
                                    if (baseEstTotal > settings.codLimit) {
                                      setValidationError(`Cash on Delivery is limited to orders below ₹${settings.codLimit.toLocaleString('en-IN')}`);
                                      return;
                                    }
                                    setPaymentMethod('cod');
                                    setValidationError('');
                                  }}
                                  className={`p-4 border flex items-start gap-3 transition-all duration-350 rounded-sm relative
                                    ${paymentMethod === 'cod'
                                      ? 'border-brand-gold bg-bg-cream/10 shadow-sm'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'}
                                    ${(Math.max(0, cartTotal - discountAmount + shippingFee + insuranceFee) > settings.codLimit) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all
                                    ${paymentMethod === 'cod' ? 'border-brand-gold text-brand-gold' : 'border-gray-300'}`}
                                  >
                                    {paymentMethod === 'cod' && (
                                      <span className="w-2 h-2 rounded-full bg-brand-gold" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-xs font-bold text-brand-brown block leading-tight mb-1">
                                      Cash on Delivery (COD)
                                      {Math.max(0, cartTotal - discountAmount + shippingFee + insuranceFee) > settings.codLimit && (
                                        <span className="ml-1.5 text-[9px] text-red-500 font-normal normal-case">Limit Exceeded</span>
                                      )}
                                    </span>
                                    <p className="text-[10px] text-gray-400 font-primary leading-normal">
                                      Pay with cash upon secure delivery at your door (+₹{settings.codExtraCharge} convenience fee)
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 border border-dashed border-gray-200 bg-gray-50/50 rounded-sm flex items-start gap-3 opacity-60">
                                  <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0 mt-0.5 bg-gray-100" />
                                  <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-400 block leading-tight mb-1">COD (Disabled)</span>
                                    <p className="text-[10px] text-gray-400 font-primary leading-normal">Cash on Delivery is currently unavailable</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Custom Styled Terms of Service checkbox */}
                          <div className="flex items-start gap-3 select-none py-1">
                            <div className="flex items-center h-5">
                              <button
                                type="button"
                                onClick={() => setAcceptTerms(!acceptTerms)}
                                className={`w-4.5 h-4.5 border rounded-xs transition-all flex items-center justify-center cursor-pointer
                                  ${acceptTerms
                                    ? 'bg-brand-brown border-brand-brown text-white'
                                    : 'bg-white border-gray-300 hover:border-brand-gold'}`}
                              >
                                {acceptTerms && <Check className="w-3 h-3 stroke-3" />}
                              </button>
                            </div>
                            <div className="text-[11px] leading-snug text-gray-550 font-primary">
                              I accept the{' '}
                              <Link href="/terms" target="_blank" className="text-brand-brown font-semibold underline hover:text-brand-gold transition-colors">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link href="/privacy" target="_blank" className="text-brand-brown font-semibold underline hover:text-brand-gold transition-colors">
                                Privacy Policy
                              </Link>
                            </div>
                          </div>

                          {/* Submit Actions */}
                          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setValidationError('');
                                setCheckoutStep(2);
                              }}
                              className="border border-brand-brown hover:border-brand-gold text-brand-brown hover:text-brand-gold py-4 font-primary text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
                            >
                              <ChevronLeft className="w-4 h-4" /> Go Back
                            </button>
                            <button
                              type="button"
                              onClick={handleCheckoutSubmit}
                              disabled={isSubmittingOrder}
                              className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white py-4 font-primary text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 rounded-xs"
                            >
                              {isSubmittingOrder ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Securing Order...</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" /> Place Order ({formatPrice(finalTotal)})
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Luxury Order Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100/50 animate-bounce">
                      <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
                    </div>

                    <span className="font-primary text-[10px] tracking-[0.25em] uppercase font-bold text-emerald-600">Order Confirmed</span>
                    <h3 className="font-secondary text-2xl text-brand-brown mt-1">Thank You For Your Purchase!</h3>

                    {/* Premium Receipt Card */}
                    <div className="my-8 bg-bg-cream/40 p-5 border border-brand-gold/10 text-xs text-left max-w-md mx-auto space-y-3 shadow-3xs rounded-sm">
                      <div className="flex justify-between items-center text-[10px] border-b border-brand-gold/10 pb-2">
                        <span className="text-gray-400 font-bold uppercase tracking-wider font-primary">Order ID:</span>
                        <span className="font-mono text-brand-brown font-bold tracking-wider">{generatedOrderId}</span>
                      </div>

                      <div className="space-y-1.5 font-primary text-gray-600">
                        <p><strong className="text-brand-brown">Recipient:</strong> {checkoutName}</p>
                        <p><strong className="text-brand-brown">Contact:</strong> {checkoutPhone} · {checkoutEmail}</p>
                        <p>
                          <strong className="text-brand-brown">Shipping Address:</strong> {checkoutAddress}{checkoutArea ? `, ${checkoutArea}` : ''}, {checkoutCity}, {checkoutState}, {checkoutCountry} - {checkoutPincode}
                        </p>
                        <p className="flex items-center gap-1.5"><strong className="text-brand-brown font-bold">Payment Status:</strong>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wider leading-none">
                            {paymentMethod === 'cod' ? 'Pending COD' : 'Verified Secure'}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-brand-gold/15 mt-2 flex justify-between items-baseline font-secondary">
                        <span className="text-brand-brown text-xs font-bold uppercase tracking-wider">Amount Paid:</span>
                        <span className="text-base font-bold text-brand-brown">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <p className="font-primary text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mb-8">
                      Your order has been recorded securely. An insured shipping confirmation containing packaging guidelines and invoice has been dispatched to {checkoutEmail}.
                    </p>

                    <button
                      onClick={closeCheckoutModal}
                      className="px-10 py-4 bg-brand-brown text-white hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-primary tracking-[0.2em] uppercase font-bold text-[10px] shadow-md cursor-pointer"
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
