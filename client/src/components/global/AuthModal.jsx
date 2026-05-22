"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, MapPin, X, ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    login, 
    register, 
    authModalRedirectTab 
  } = useAuth();
  
  const router = useRouter();

  const [step, setStep] = useState('email'); // 'email' | 'checking' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset fields when modal is closed/opened
  useEffect(() => {
    if (!isAuthModalOpen) {
      setTimeout(() => {
        setStep('email');
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setPincode('');
        setError('');
        setSuccess(false);
      }, 300);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setStep('checking');

    // Simulate premium checking
    setTimeout(() => {
      const isRegistered = email.trim().toLowerCase() === 'mohan@badiger.com';
      if (isRegistered) {
        setStep('login');
      } else {
        setStep('register');
      }
    }, 1200);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      login(email, password);
      closeAuthModal();
      
      // Redirect if requested
      if (authModalRedirectTab) {
        router.push(`/account?tab=${authModalRedirectTab}`);
      } else {
        router.push('/account');
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !password || !pincode) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      setError('Pincode must be exactly 6 digits.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      register(name, email, phone, password, pincode);
      closeAuthModal();
      
      // Redirect if requested
      if (authModalRedirectTab) {
        router.push(`/account?tab=${authModalRedirectTab}`);
      } else {
        router.push('/account');
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
          className="bg-white max-w-md w-full border border-brand-gold/20 shadow-2xl relative z-10 overflow-hidden rounded-none"
        >
          {/* Header Accent */}
          <div className="h-1.5 bg-gradient-to-r from-brand-brown via-brand-gold to-brand-brown" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-5 text-gray-400 hover:text-brand-brown transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            
            {/* STEP 1: EMAIL INPUT */}
            {step === 'email' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-bg-cream border border-brand-gold/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-5 h-5 text-brand-gold" />
                  </div>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1">
                    MIP Customer Portal
                  </span>
                  <h2 className="font-secondary text-2xl text-brand-brown">Curate Your Moments</h2>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-normal">
                    Enter your email address to sign in or start your luxury savings journey.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 font-sans font-medium">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full text-xs pl-10 pr-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                      />
                      <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer"
                  >
                    Continue
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <span className="text-[8px] text-gray-400 block font-sans">
                    Use <strong className="text-brand-brown">mohan@badiger.com</strong> for registered mock user.
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHECKING TRANSITION */}
            {step === 'checking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-brand-gold block">
                  Secure Verification
                </span>
                <p className="font-sans text-xs text-gray-400 mt-1">
                  Checking registry records...
                </p>
              </motion.div>
            )}

            {/* STEP 3: LOGIN (PASSWORD ONLY) */}
            {step === 'login' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <button
                    onClick={() => setStep('email')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-brand-brown text-[10px] font-bold tracking-wider uppercase font-sans cursor-pointer mb-3"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1">
                    Member Found
                  </span>
                  <h2 className="font-secondary text-2xl text-brand-brown">Welcome Back</h2>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 truncate">
                    Signing in as <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 font-sans font-medium">
                      {error}
                    </div>
                  )}

                  {success ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center text-emerald-600">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 animate-bounce border border-emerald-100">
                        <Check className="w-6 h-6 text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="font-sans text-[10px] tracking-wider uppercase font-bold">Authenticated</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1.5">
                          Enter Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-xs pl-10 pr-3 py-3 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                          />
                          <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            )}

            {/* STEP 4: REGISTER (ALL PROFILE DETAILS) */}
            {step === 'register' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-5">
                  <button
                    onClick={() => setStep('email')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-brand-brown text-[10px] font-bold tracking-wider uppercase font-sans cursor-pointer mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1">
                    New Member Account
                  </span>
                  <h2 className="font-secondary text-2xl text-brand-brown">Create Account</h2>
                  <p className="font-sans text-[11px] text-gray-400 mt-1 truncate">
                    Registering with email <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 font-sans font-medium">
                      {error}
                    </div>
                  )}

                  {success ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center text-emerald-600">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 animate-bounce border border-emerald-100">
                        <Check className="w-6 h-6 text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="font-sans text-[10px] tracking-wider uppercase font-bold">Registered Successfully</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          Full Name
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                          />
                          <User className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          Mobile Phone
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                          />
                          <Phone className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create security password"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                          />
                          <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          Pincode
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            pattern="^[0-9]{6}$"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="e.g. 587311"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                          />
                          <MapPin className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer pt-2.5"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
