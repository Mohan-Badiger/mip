"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ClipboardList, Sparkles, Truck, 
  CheckCircle2, XCircle, ShieldCheck, ExternalLink, 
  RefreshCw, MapPin, CreditCard, ShoppingBag, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/global/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/products';

function OrderStatusTracker({ status, trackingId, orderDate }) {
  const isCancelled = status.toLowerCase() === 'cancelled';
  
  // Resolve current active step index
  const getStepIndex = (statusStr) => {
    const s = statusStr.toLowerCase();
    if (s === 'processing' || s === 'crafting') return 1;
    if (s === 'shipped' || s === 'transit') return 2;
    if (s === 'delivered') return 3;
    return 0; // pending, received, confirmed
  };

  const currentStep = getStepIndex(status);
  
  const steps = [
    { 
      title: 'Confirmed', 
      desc: 'Placed & verified', 
      date: orderDate 
    },
    { 
      title: 'Crafting', 
      desc: 'In progress', 
      date: orderDate ? new Date(new Date(orderDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      title: 'Transit', 
      desc: 'In transit', 
      date: orderDate ? new Date(new Date(orderDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      title: 'Delivered', 
      desc: 'Delivered', 
      date: orderDate ? new Date(new Date(orderDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    }
  ];

  if (isCancelled) {
    return (
      <div className="bg-rose-50/50 border border-rose-100/50 p-6 flex items-start gap-4 rounded-xs font-primary">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-800 uppercase tracking-wider">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            This order has been cancelled. If any payment was deducted, it will be refunded to your source account within 5-7 business days. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentage: Confirmed = 0%, Crafting = 33.3%, Transit = 66.6%, Delivered = 100%
  const progressPercent = (currentStep / 3) * 100;

  return (
    <div className="my-8 font-primary">
      {/* Linear Progress Bar Container */}
      <div className="relative mb-8 mt-6 px-2">
        {/* Track Line */}
        <div className="h-2 bg-slate-100 rounded-full w-full" />
        
        {/* Filled Progress Line */}
        <div className="absolute top-0 left-2 right-2 h-2 pointer-events-none">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-full bg-linear-to-r from-brand-brown via-brand-gold to-brand-gold-light rounded-full"
          />
        </div>

        {/* Step Indicator Nodes (Dots) on the Bar */}
        <div className="absolute top-1/2 left-2 right-2 h-0 pointer-events-none">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <div 
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all bg-white absolute -translate-x-1/2 -translate-y-1/2 ${
                  isCompleted || isActive
                    ? 'border-brand-gold bg-brand-gold' 
                    : 'border-gray-200 bg-white'
                }`}
                style={{ left: `${(idx / 3) * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Grid of Step Labels below the Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          
          return (
            <div 
              key={idx} 
              className={`flex flex-col ${
                idx === 0 
                  ? 'text-left' 
                  : idx === steps.length - 1 
                    ? 'text-right md:text-right' 
                    : 'text-center md:text-center'
              } ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}
            >
              <span className={`text-xs uppercase tracking-wider font-bold block ${
                isActive 
                  ? 'text-brand-brown' 
                  : isCompleted 
                    ? 'text-brand-brown/80' 
                    : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 block leading-tight">
                {step.desc}
              </span>
              {step.date && (idx <= currentStep) && (
                <span className="text-[9px] font-semibold text-brand-gold block mt-1.5 uppercase tracking-wider">
                  {step.date}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Shipped transit details panel */}
      {currentStep >= 2 && (
        <div className="mt-10 bg-bg-cream/40 border border-brand-gold/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-brand-brown uppercase tracking-wider">Fully Insured Shipment</h5>
              <p className="text-[10px] text-gray-550 leading-relaxed mt-0.5">
                Sent via <strong className="text-brand-brown font-semibold">Blue Dart Express</strong> with tracking code <code className="font-mono font-bold text-brand-brown bg-white px-1.5 py-0.5 border border-brand-gold/10 rounded-xs">{trackingId || 'MIP-BD-72300481'}</code>. Fully covered for premium transport.
              </p>
            </div>
          </div>
          <a
            href={`https://www.bluedart.com/tracking?trackid=${trackingId || 'MIP-BD-72300481'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-bg-cream text-brand-brown hover:text-brand-gold border border-brand-gold/15 px-4 py-2 font-primary text-[10px] font-bold tracking-widest uppercase transition-colors shrink-0 cursor-pointer shadow-3xs"
          >
            <span>Track Parcel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { orders, isMounted, isLoggedIn, fetchOrders } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (isMounted && isLoggedIn) {
        setIsRefreshing(true);
        try {
          await fetchOrders();
        } catch (err) {
          console.error('Error refreshing orders:', err);
        } finally {
          if (active) {
            setIsRefreshing(false);
          }
        }
      } else if (isMounted) {
        setIsRefreshing(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [isMounted, isLoggedIn]);
  
  const order = orders.find(o => o.id === id);

  if (!isMounted || isRefreshing) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-bg-cream">
          <div className="w-8 h-8 border-3 border-brand-brown border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="bg-bg-cream min-h-[60vh] py-16 flex items-center justify-center">
          <div className="max-w-100 w-full mx-auto px-4 text-center">
            <h1 className="font-primary text-2xl text-brand-brown font-bold mb-2">Access Denied</h1>
            <p className="font-primary text-xs text-gray-500 mb-6">
              Please sign in to view this private order shipment status details page.
            </p>
            <button
              onClick={() => router.push('/account?tab=orders')}
              className="bg-brand-brown hover:bg-brand-gold text-white font-primary text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors cursor-pointer"
            >
              Go to Login Portal
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="bg-bg-cream min-h-[60vh] py-16 flex items-center justify-center">
          <div className="max-w-100 w-full mx-auto px-4 text-center">
            <ShoppingBag className="w-12 h-12 text-brand-gold mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="font-primary text-2xl text-brand-brown font-bold mb-2">Order Not Found</h1>
            <p className="font-primary text-xs text-gray-555 mb-6">
              The order ID <code className="font-mono bg-white p-1 text-xs border rounded-xs">{id}</code> could not be found in your account history ledger.
            </p>
            <Link
              href="/account?tab=orders"
              className="bg-brand-brown hover:bg-brand-gold text-white font-primary text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors inline-block"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const currentStatus = order.status || 'Pending';
  
  const statusColors = {
    Pending: 'bg-amber-50 text-amber-800 border-amber-100/50',
    Processing: 'bg-indigo-50 text-indigo-805 border-indigo-100/50',
    Shipped: 'bg-blue-50 text-blue-800 border-blue-100/50',
    Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-100/50',
    Cancelled: 'bg-rose-50 text-rose-800 border-rose-100/50',
  };
  const badgeStyle = statusColors[currentStatus] || 'bg-gray-50 text-gray-800 border-gray-100/50';

  return (
    <PageLayout>
      <div className="bg-bg-cream min-h-screen py-8 md:py-12 text-text-dark font-primary">
        <div className="max-w-300 mx-auto px-4 md:px-8">
          
          {/* Breadcrumbs and navigation */}
          <div className="mb-6">
            <Link 
              href="/account?tab=orders"
              className="inline-flex items-center gap-1 text-xs text-gray-450 hover:text-brand-gold uppercase tracking-wider font-semibold font-primary transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to My Orders</span>
            </Link>
          </div>

          {/* Heading Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-gold/10">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold block mb-1">
                Secure Delivery Portal
              </span>
              <h1 className="font-secondary text-2xl md:text-3xl text-brand-brown tracking-wide">
                Tracking Order #{order.id}
              </h1>
            </div>
          </div>

          {/* Grid Layout: Stepper (Full Width) & details box */}
          <div className="space-y-8">
            
            {/* Visual Stepper Card */}
            <div className="bg-white border border-brand-gold/15 p-6 md:p-8 shadow-2xs">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-primary text-base font-bold text-brand-brown uppercase tracking-wider">Fulfillment Stage</h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${badgeStyle}`}>
                  {currentStatus}
                </span>
              </div>
              
              <OrderStatusTracker 
                status={currentStatus} 
                trackingId={order.trackingId} 
                orderDate={order.date} 
              />
            </div>

            {/* Split Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white border border-brand-gold/15 p-6 shadow-2xs">
                <h3 className="font-primary text-sm font-bold text-brand-brown uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                  <MapPin className="w-4 h-4 text-brand-gold" /> Shipping Address
                </h3>
                <div className="text-xs text-gray-700 leading-relaxed font-primary space-y-1">
                  <p className="font-bold text-brand-brown">{order.shippingAddress?.street || 'Default Address'}</p>
                  <p>{order.shippingAddress?.city || 'Banahatti'}, {order.shippingAddress?.state || 'Karnataka'}</p>
                  <p className="font-mono tracking-wider font-semibold">PIN: {order.shippingAddress?.pincode || '587311'}</p>
                  <p>Country: {order.shippingAddress?.country || 'India'}</p>
                </div>
              </div>

              {/* Payment details */}
              <div className="bg-white border border-brand-gold/15 p-6 shadow-2xs">
                <h3 className="font-primary text-sm font-bold text-brand-brown uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                  <CreditCard className="w-4 h-4 text-brand-gold" /> Payment Summary
                </h3>
                <div className="text-xs text-gray-700 leading-relaxed font-primary space-y-1.5">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <strong className="text-brand-brown uppercase font-semibold">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}</strong>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-1.5">
                    <span>Payment Status:</span>
                    <strong className="text-brand-brown uppercase font-semibold">{order.paymentStatus || 'captured'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Purchased Items and Receipt */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items Card */}
              <div className="lg:col-span-8 bg-white border border-brand-gold/15 p-6 shadow-2xs">
                <h3 className="font-primary text-sm font-bold text-brand-brown uppercase tracking-wider mb-5 pb-2 border-b border-gray-100">
                  Items Details ({order.items.length})
                </h3>
                
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                      <div className="relative w-16 h-16 bg-bg-cream overflow-hidden border border-gray-100 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-primary text-sm text-brand-brown font-bold truncate leading-snug">
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
                        <span className="font-primary text-xs text-brand-brown font-bold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices and Cost Breakdown Card */}
              <div className="lg:col-span-4 bg-white border border-brand-gold/15 p-6 shadow-2xs">
                <h3 className="font-primary text-sm font-bold text-brand-brown uppercase tracking-wider mb-5 pb-2 border-b border-gray-100">
                  Order Invoice
                </h3>
                
                <div className="space-y-3.5 text-xs text-gray-550 font-primary">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-700">{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                   {order.discount > 0 && (
                     <div className="flex flex-col gap-1.5 bg-emerald-50/50 p-2 border border-emerald-100/50">
                       {order.couponCode && (
                         <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                           <span>Coupon:</span>
                           <span className="bg-white border px-1 py-0.5 rounded">{order.couponCode}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-emerald-700 font-semibold">
                         <span>Promo Discount</span>
                         <span>-{formatPrice(order.discount)}</span>
                       </div>
                     </div>
                   )}
                  <div className="flex justify-between">
                    <span>BIS Hallmarking & QA</span>
                    <span className="text-emerald-700 font-bold uppercase text-[9px] tracking-wide">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Courier</span>
                    <span className="text-emerald-700 font-bold uppercase text-[9px] tracking-wide">Free</span>
                  </div>
                  
                  <div className="flex justify-between font-primary text-sm font-bold text-brand-brown border-t border-slate-100 pt-3.5 mt-2">
                    <span>Grand Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-gray-550 border-t border-slate-100 pt-2.5 mt-1.5">
                    <span>Amount Paid</span>
                    <span>
                      {order.paymentMethod === 'cod' && order.paymentStatus === 'pending'
                        ? formatPrice(0)
                        : formatPrice(order.total)}
                    </span>
                  </div>

                  {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                    <div className="flex justify-between text-xs font-bold text-amber-700 mt-1.5">
                      <span>To Pay on Delivery</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
