"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Clock, Navigation,
  Calendar, User, Mail,
  X, Check, ArrowRight,
  ChevronRight, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVE_STORE = {
  id: 1,
  name: 'M.I. Pattar & Sons Jewellers',
  address: 'Mangalwar Peth, Near Vitthal Mandir, Banahatti, Karnataka 587311',
  phone: '+91 94481 29285',
  landline: '08351-230125',
  hours: '10:00 AM – 08:30 PM',
  tag: 'Flagship Showroom'
};

const UPCOMING_STORE = {
  id: 2,
  name: 'M.I. Pattar & Sons – New Town Showroom',
  address: 'Extension Area, Banahatti, Karnataka 587311',
  tag: 'Upcoming Extension'
};

export default function StoresClient() {
  const [activeTab, setActiveTab] = useState('flagship'); // 'flagship' or 'upcoming'
  const [currentTime, setCurrentTime] = useState(null);
  
  // Appointment Form state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');

  // Notify Me Form state (for upcoming store)
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(new Date());
    }, 0);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getStoreStatus = () => {
    if (!currentTime) return { text: 'Loading...', color: 'text-gray-400', bg: 'bg-gray-100', code: 'loading' };

    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const openTime = 10; // 10:00 AM
    const closeTime = 20.5; // 8:30 PM

    if (currentHour >= openTime && currentHour < closeTime) {
      const remainingTime = closeTime - currentHour;
      if (remainingTime < 1) {
        return {
          text: `Closing Soon (closes 8:30 PM)`,
          color: 'text-amber-600',
          bg: 'bg-amber-50 border border-amber-100',
          code: 'closing_soon'
        };
      }
      return {
        text: `Open Now (until 8:30 PM)`,
        color: 'text-emerald-600 font-medium',
        bg: 'bg-emerald-50 border border-emerald-100/50',
        code: 'open'
      };
    } else {
      return {
        text: `Closed (Opens 10:00 AM)`,
        color: 'text-gray-500',
        bg: 'bg-gray-50 border border-gray-100',
        code: 'closed'
      };
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const randomRef = 'MIP-' + Math.floor(100000 + Math.random() * 900000);
      setAppointmentId(randomRef);
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 1500);
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    setIsNotifying(true);

    setTimeout(() => {
      setIsNotifying(false);
      setNotifySuccess(true);
      setNotifyEmail('');
      setTimeout(() => setNotifySuccess(false), 6000);
    }, 1200);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
    setBookingSuccess(false);
    setBookingName('');
    setBookingEmail('');
    setBookingPhone('');
    setBookingDate('');
    setBookingMessage('');
  };

  const currentStatus = getStoreStatus();

  return (
    <div className="bg-bg-cream min-h-screen text-text-dark font-primary relative pb-16">
      
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden border-b border-brand-brown/10 py-12 md:py-20 text-center bg-brand-brown">
        {/* Background Image with luxury aesthetic */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/images/showroom_banner_bg.png')" }}
        />
        {/* Subtle dark overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1.5px,_transparent_1.5px),_linear-gradient(90deg,_rgba(255,255,255,0.03)_1.5px,_transparent_1.5px)] bg-[size:30px_30px]" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="font-primary text-[10px] tracking-[0.4em] uppercase text-brand-gold-light font-bold block mb-3">
            Our Showrooms
          </span>
          <h1 className="font-secondary text-4xl md:text-6xl text-white tracking-wide mb-4 leading-tight">
            Flagship & Locations
          </h1>
          <p className="font-primary text-gray-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Experience our legacy of pure craftsmanship. Visit us in Banahatti to discover our heritage gold collections and modern masterpieces.
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 z-30 shadow-xs">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <nav className="text-[11px] font-primary text-gray-400 tracking-wide">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
              <li className="text-gray-300">/</li>
              <li className="text-brand-brown font-medium">Showrooms</li>
            </ol>
          </nav>
          
          <div className="text-[11px] font-primary text-gray-400 tracking-wide hidden sm:block">
            Banahatti, Karnataka (587311)
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Showroom Selection & Details (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Showroom Toggle Tabs - Boxy Design */}
            <div className="bg-white p-1 border border-brand-gold/10 shadow-xs flex rounded-none">
              <button
                onClick={() => setActiveTab('flagship')}
                className={`flex-1 py-3 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative cursor-pointer ${
                  activeTab === 'flagship'
                    ? 'bg-brand-brown text-white shadow-md'
                    : 'text-brand-brown hover:bg-brand-brown/5'
                }`}
              >
                Flagship Store
                <span className="block text-[8px] opacity-75 font-normal tracking-normal capitalize mt-0.5">Active Showroom</span>
              </button>
              
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-3 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative cursor-pointer ${
                  activeTab === 'upcoming'
                    ? 'bg-brand-brown text-white shadow-md'
                    : 'text-brand-brown hover:bg-brand-brown/5'
                }`}
              >
                New Town
                <span className="block text-[8px] opacity-75 font-normal tracking-normal capitalize mt-0.5">Upcoming Extension</span>
              </button>
            </div>

            {/* Dynamic Content Panel */}
            <AnimatePresence mode="wait">
              {activeTab === 'flagship' ? (
                <motion.div
                  key="flagship"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Flagship Showroom Card - Boxy Design */}
                  <div className="bg-white rounded-none border border-brand-gold/15 p-6 md:p-8 shadow-xs relative overflow-hidden">
                    
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="inline-block font-primary text-[8px] tracking-[0.2em] uppercase font-bold bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-none mb-2">
                          {ACTIVE_STORE.tag}
                        </span>
                        <h2 className="font-secondary text-2xl md:text-3xl text-brand-brown leading-snug">
                          {ACTIVE_STORE.name}
                        </h2>
                      </div>
                      
                      {/* Live Status Badge - Boxy Design */}
                      <span className={`shrink-0 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-none font-semibold ${currentStatus.bg} ${currentStatus.color}`}>
                        {currentStatus.text.split(' (')[0]}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4 font-primary text-xs border-b border-gray-100 pb-6 mb-6">
                      <div className="flex gap-3 items-start group">
                        <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div className="space-y-1">
                          <p className="leading-relaxed text-gray-600 font-medium">{ACTIVE_STORE.address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="flex gap-3 items-center">
                          <Phone className="w-5 h-5 text-brand-gold shrink-0" strokeWidth={1.5} />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Mobile</p>
                            <a href={`tel:${ACTIVE_STORE.phone.replace(/\s+/g, '')}`} className="hover:text-brand-brown transition-colors text-gray-700 font-semibold text-sm">
                              {ACTIVE_STORE.phone}
                            </a>
                          </div>
                        </div>

                        <div className="flex gap-3 items-center">
                          <Phone className="w-5 h-5 text-brand-gold shrink-0" strokeWidth={1.5} />
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Landline</p>
                            <a href={`tel:${ACTIVE_STORE.landline.replace(/-/g, '')}`} className="hover:text-brand-brown transition-colors text-gray-700 font-semibold text-sm">
                              {ACTIVE_STORE.landline}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center pt-2">
                        <Clock className="w-5 h-5 text-brand-gold shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Opening Hours</p>
                          <p className="text-gray-700 font-semibold">{ACTIVE_STORE.hours} <span className="text-gray-400 font-normal">(Open Daily)</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons - Boxy Design */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="https://maps.google.com/?q=M+I+Pattar+and+Sons+Jewellers+Banahatti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 font-primary text-xs tracking-[0.18em] uppercase font-bold text-brand-brown hover:text-brand-gold transition-colors py-3.5 px-4 border border-gray-200 rounded-none bg-white shadow-xs hover:border-brand-gold/40"
                      >
                        <Navigation className="w-4 h-4" /> Get Directions
                      </a>

                      <button
                        onClick={() => setIsBookingOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 font-primary text-xs tracking-[0.18em] uppercase font-bold text-white bg-brand-brown hover:bg-brand-gold hover:text-brand-brown py-3.5 px-4 rounded-none transition-all duration-300 shadow-md cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" /> Book VIP Visit
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Upcoming Store Teaser Card - Boxy Design */}
                  <div className="bg-brand-brown text-white rounded-none border border-brand-gold/20 p-6 md:p-8 shadow-md relative overflow-hidden">
                    <span className="inline-block font-primary text-[8px] tracking-[0.25em] uppercase font-bold bg-brand-gold/20 text-brand-gold px-2.5 py-1 rounded-none mb-3 border border-brand-gold/30">
                      {UPCOMING_STORE.tag}
                    </span>
                    <h2 className="font-secondary text-2xl md:text-3xl text-brand-gold tracking-wide leading-snug mb-3">
                      {UPCOMING_STORE.name}
                    </h2>
                    <p className="font-primary text-xs text-gray-300 leading-relaxed mb-6">
                      Our new expansion showroom in the Extension Area of Banahatti will feature architectural grandeur, custom diamond view lounges, and a digital showroom experience. Opening shortly.
                    </p>

                    <div className="space-y-3 font-primary text-xs text-gray-300 border-t border-white/10 pt-5 mb-2">
                      <div className="flex gap-3 items-center">
                        <MapPin className="w-4 h-4 text-brand-gold shrink-0" strokeWidth={1.5} />
                        <span>{UPCOMING_STORE.address}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <Clock className="w-4 h-4 text-brand-gold shrink-0" strokeWidth={1.5} />
                        <span className="text-brand-gold font-medium">Launching Late 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* VIP Launch Invitation Form - Boxy Design */}
                  <div className="bg-white rounded-none border border-brand-gold/15 p-6 md:p-8 shadow-xs relative">
                    <h3 className="font-secondary text-lg text-brand-brown tracking-wide mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-brand-gold" />
                      VIP Launch Invitation
                    </h3>
                    <p className="font-primary text-xs text-gray-400 mb-6 leading-relaxed">
                      Enter your email to receive a private VIP invitation to our grand launching ceremony and first access to launch collections.
                    </p>

                    {!notifySuccess ? (
                      <form onSubmit={handleNotifySubmit} className="space-y-3">
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.value)}
                            placeholder="your.email@domain.com"
                            className="w-full text-xs pl-10 pr-4 py-3.5 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 placeholder-gray-400 transition-colors"
                          />
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isNotifying}
                          className="w-full bg-brand-brown text-white hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-primary tracking-[0.2em] uppercase font-bold text-[11px] py-3.5 rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
                        >
                          {isNotifying ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin" />
                          ) : (
                            <>
                              <span>Request Invitation</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-none text-center"
                      >
                        <div className="w-10 h-10 bg-emerald-100 rounded-none flex items-center justify-center mx-auto mb-3">
                          <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <h4 className="font-secondary text-sm text-brand-brown font-bold mb-1">Successfully Registered!</h4>
                        <p className="font-primary text-[11px] text-gray-500 leading-normal">
                          Thank you for registering. An confirmation invite request has been queued for your email address.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Beautiful Google Maps Embed (7 Columns) - Boxy Design */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-none border border-brand-gold/15 p-4 md:p-6 shadow-md flex flex-col h-[520px] md:h-[660px] relative overflow-hidden">
              
              {/* Map Title/Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-brand-gold animate-pulse" />
                  <div>
                    <h3 className="font-secondary text-base md:text-lg text-brand-brown tracking-wide">
                      Showroom Navigation Map
                    </h3>
                    <p className="text-[10px] text-gray-400 font-primary tracking-wide">
                      Verified Google Maps location for M.I. Pattar & Sons Jewellers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://maps.google.com/?q=M+I+Pattar+and+Sons+Jewellers+Banahatti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-gray-200 hover:border-brand-gold text-brand-brown hover:text-brand-gold rounded-none transition-colors bg-white shadow-xs flex items-center justify-center"
                    title="Open in Google Maps"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Verified Embedded Google Map Iframe - Boxy Design */}
              <div className="flex-1 w-full bg-[#FAF8F5] border border-gray-100 overflow-hidden shadow-inner relative rounded-none">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.28553504083345!2d75.12888304889204!3d16.482149883455758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc731e84330dc17%3A0xe2739dd3d69b5097!2sM%20I%20PATTAR%20AND%20SONS%20JEWELLERS!5e1!3m2!1sen!2sin!4v1779422735979!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full rounded-none"
                ></iframe>
              </div>

              {/* Quick Info bar at bottom of Map - Boxy Design */}
              <div className="mt-4 border border-brand-gold/15 bg-bg-cream/30 p-3.5 rounded-none flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="text-[11px] text-gray-500 font-medium font-primary truncate max-w-xs md:max-w-md">
                    {ACTIVE_STORE.address}
                  </span>
                </div>
                
                <a
                  href="https://maps.google.com/?q=M+I+Pattar+and+Sons+Jewellers+Banahatti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 text-[10px] tracking-wider uppercase font-bold text-brand-brown hover:text-brand-gold transition-colors"
                >
                  <span>Open Map</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* APPOINTMENT BOOKING MODAL - Boxy Design */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBookingModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body - Boxy Design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-none w-full max-w-lg border border-brand-gold/20 shadow-2xl relative overflow-hidden z-10"
            >
              {/* Header border design */}
              <div className="h-1.5 bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown" />

              {/* Close button */}
              <button
                onClick={closeBookingModal}
                className="absolute right-4 top-5 text-gray-400 hover:text-text-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8">
                {!bookingSuccess ? (
                  <>
                    <div className="mb-6">
                      <span className="font-primary text-[9px] tracking-[0.25em] uppercase font-bold text-brand-gold">VIP Concierge Service</span>
                      <h3 className="font-secondary text-2xl text-brand-brown mt-1">Book Showroom Visit</h3>
                      <p className="font-primary text-xs text-gray-400 mt-1">
                        Scheduling for: <span className="text-brand-brown font-semibold">{ACTIVE_STORE.name}</span>
                      </p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      {/* Name input */}
                      <div className="relative">
                        <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full text-xs pl-9 pr-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                          />
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Contact row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Phone Number</label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              value={bookingPhone}
                              onChange={(e) => setBookingPhone(e.target.value)}
                              placeholder="Phone number"
                              className="w-full text-xs pl-9 pr-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                            />
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={bookingEmail}
                              onChange={(e) => setBookingEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="w-full text-xs pl-9 pr-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary"
                            />
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Message / Requirements Box */}
                      <div>
                        <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Message / Requirements</label>
                        <textarea
                          value={bookingMessage}
                          onChange={(e) => setBookingMessage(e.target.value)}
                          rows={3}
                          placeholder="Enter any specific requirements, design preferences or questions..."
                          className="w-full text-xs px-3 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-primary resize-none"
                        />
                      </div>

                      {/* Date & Time Select */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Date</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]} // Disable past dates
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-white font-primary"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] tracking-widest text-brand-brown uppercase font-bold block mb-1">Time Slot</label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full text-xs px-3 py-3 border border-gray-200 rounded-none focus:outline-none focus:border-brand-gold text-text-dark bg-white font-primary"
                          >
                            <option value="10:30 AM">10:30 AM - 11:30 AM</option>
                            <option value="12:00 PM">12:00 PM - 01:00 PM</option>
                            <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                            <option value="03:30 PM">03:30 PM - 04:30 PM</option>
                            <option value="05:00 PM">05:00 PM - 06:00 PM</option>
                            <option value="06:30 PM">06:30 PM - 07:30 PM</option>
                          </select>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-brown text-white hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-primary tracking-[0.2em] uppercase font-bold text-[11px] py-3.5 rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin" />
                            <span>Booking Request...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Booking</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  // Success State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-none flex items-center justify-center mx-auto mb-5 border border-emerald-100 animate-bounce">
                      <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
                    </div>

                    <span className="font-primary text-[9px] tracking-[0.25em] uppercase font-bold text-emerald-600">Consultation Scheduled</span>
                    <h3 className="font-secondary text-2xl text-brand-brown mt-1">Visit Request Confirmed!</h3>

                    <div className="my-6 bg-bg-cream/60 p-4 rounded-none border border-gray-100 space-y-2 text-xs text-left max-w-sm mx-auto">
                      <p className="text-gray-500"><strong className="text-brand-brown">Showroom:</strong> {ACTIVE_STORE.name}</p>
                      <p className="text-gray-500"><strong className="text-brand-brown">Consultant Name:</strong> {bookingName}</p>
                      {bookingMessage && <p className="text-gray-500"><strong className="text-brand-brown">Message:</strong> {bookingMessage}</p>}
                      <p className="text-gray-500"><strong className="text-brand-brown">Date & Time:</strong> {bookingDate} at {bookingTime}</p>
                      <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Reference ID:</span>
                        <span className="font-mono text-brand-brown font-bold tracking-wider">{appointmentId}</span>
                      </div>
                    </div>

                    <p className="font-primary text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                      A confirmation email and SMS have been dispatched with appointment instructions. Our showroom manager will contact you to finalize custom requirements.
                    </p>

                    <button
                      onClick={closeBookingModal}
                      className="px-6 py-2.5 bg-brand-brown text-white hover:bg-brand-gold hover:text-brand-brown transition-all duration-300 font-primary tracking-[0.18em] uppercase font-bold text-[10px] rounded-none shadow-sm cursor-pointer"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
