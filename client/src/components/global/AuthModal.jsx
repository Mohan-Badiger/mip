"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Phone, X, ArrowLeft, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    login, 
    register, 
    authModalRedirectTab,
    sendOtp,
    verifyOtp,
    resetPassword
  } = useAuth();
  
  const router = useRouter();

  const [step, setStep] = useState('email'); // 'email' | 'checking' | 'login' | 'register' | 'verify-otp' | 'reset-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [privacyChecked, setPrivacyChecked] = useState(false);
  
  // OTP Verification and Reset States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpType, setOtpType] = useState('register'); // 'register' | 'login' | 'reset'
  const [tempResetToken, setTempResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const otpInputRefs = useRef([]);

  // Reset fields when modal is closed/opened
  useEffect(() => {
    if (!isAuthModalOpen) {
      setTimeout(() => {
        setStep('email');
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setPrivacyChecked(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpType('register');
        setTempResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setIsLoading(false);
        setError('');
        setSuccess(false);
      }, 300);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setStep('checking');

    try {
      const res = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        if (data.exists) {
          setStep('login');
        } else {
          setStep('register');
        }
      } else {
        setError(data.error || 'Verification failed. Please try again.');
        setStep('email');
      }
    } catch {
      setError('Failed to contact authentication server.');
      setStep('email');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res && res.success) {
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        if (authModalRedirectTab) {
          router.push(`/account?tab=${authModalRedirectTab}`);
        } else {
          router.push('/account');
        }
      }, 1000);
    } else {
      setError(res?.error || 'Invalid email or password.');
    }
  };

  const handleLoginWithOtpClick = async () => {
    setError('');
    setIsLoading(true);
    const res = await sendOtp(email, 'login');
    setIsLoading(false);

    if (res && res.success) {
      setOtpType('login');
      setOtpDigits(['', '', '', '', '', '']);
      setStep('verify-otp');
    } else {
      setError(res?.error || 'Failed to send verification code. Please try again.');
    }
  };

  const handleForgotPasswordClick = async () => {
    setError('');
    setIsLoading(true);
    const res = await sendOtp(email, 'reset');
    setIsLoading(false);

    if (res && res.success) {
      setOtpType('reset');
      setOtpDigits(['', '', '', '', '', '']);
      setStep('verify-otp');
    } else {
      setError(res?.error || 'Failed to send verification code. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !password) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!privacyChecked) {
      setError('You must agree to the Privacy Policy.');
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(email, 'register', { name, phone, password });
    setIsLoading(false);

    if (res && res.success) {
      setOtpType('register');
      setOtpDigits(['', '', '', '', '', '']);
      setStep('verify-otp');
    } else {
      setError(res?.error || 'Registration failed. Please check your inputs.');
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^[0-9]{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpDigits(digits);
    
    // Focus the last input
    otpInputRefs.current[5]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(email, otpCode, otpType);
    setIsLoading(false);

    if (res && res.success) {
      if (otpType === 'reset') {
        setTempResetToken(res.tempToken);
        setStep('reset-password');
      } else {
        setSuccess(true);
        setTimeout(() => {
          closeAuthModal();
          if (authModalRedirectTab) {
            router.push(`/account?tab=${authModalRedirectTab}`);
          } else {
            router.push('/account');
          }
        }, 1000);
      }
    } else {
      setError(res?.error || 'Invalid or expired verification code.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email, tempResetToken, newPassword);
    setIsLoading(false);

    if (res && res.success) {
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        if (authModalRedirectTab) {
          router.push(`/account?tab=${authModalRedirectTab}`);
        } else {
          router.push('/account');
        }
      }, 1000);
    } else {
      setError(res?.error || 'Reset failed. Please request a new code.');
    }
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
                    disabled={isLoading}
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
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-sans px-0.5">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={handleForgotPasswordClick}
                          className="text-gray-450 hover:text-brand-brown underline cursor-pointer hover:font-medium transition-colors"
                        >
                          Forgot Password?
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={handleLoginWithOtpClick}
                          className="text-brand-gold hover:text-brand-brown font-semibold underline cursor-pointer transition-colors"
                        >
                          Login with OTP
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
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
                    disabled={isLoading}
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
                            disabled={isLoading}
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
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your mobile phone"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                            disabled={isLoading}
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
                            placeholder="Create security password (min 6 chars)"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-1 pb-1">
                        <input
                          type="checkbox"
                          id="privacyPolicy"
                          required
                          checked={privacyChecked}
                          onChange={(e) => setPrivacyChecked(e.target.checked)}
                          className="w-3.5 h-3.5 text-brand-brown border-gray-300 rounded-xs focus:ring-brand-gold cursor-pointer mt-0.5"
                          disabled={isLoading}
                        />
                        <label htmlFor="privacyPolicy" className="text-[10px] text-gray-500 font-sans cursor-pointer leading-tight select-none">
                          I agree to the <a href="#" className="text-brand-brown hover:text-brand-gold underline font-semibold transition-colors">Privacy Policy</a>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer pt-2.5"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            )}

            {/* STEP 5: VERIFY OTP */}
            {step === 'verify-otp' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-5">
                  <button
                    onClick={() => {
                      if (otpType === 'register') {
                        setStep('register');
                      } else {
                        setStep('login');
                      }
                    }}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-brand-brown text-[10px] font-bold tracking-wider uppercase font-sans cursor-pointer mb-2"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1">
                    Security Passcode
                  </span>
                  <h2 className="font-secondary text-2xl text-brand-brown">Verify Identity</h2>
                  <p className="font-sans text-[11px] text-gray-400 mt-1">
                    We've sent a 6-digit verification code to <strong>{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                      <span className="font-sans text-[10px] tracking-wider uppercase font-bold">Verified Successfully</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center gap-2.5 my-6">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className="w-11 h-12 text-center text-lg font-bold border border-gray-200 focus:outline-none focus:border-brand-gold text-brand-brown bg-bg-cream/10 font-mono"
                            disabled={isLoading}
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </>
                        ) : (
                          'Verify & Proceed'
                        )}
                      </button>
                    </>
                  )}
                </form>
              </motion.div>
            )}

            {/* STEP 6: RESET PASSWORD */}
            {step === 'reset-password' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-5">
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block mb-1">
                    Secure Account
                  </span>
                  <h2 className="font-secondary text-2xl text-brand-brown">Reset Password</h2>
                  <p className="font-sans text-[11px] text-gray-400 mt-1">
                    Create a new secure password for <strong>{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
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
                      <span className="font-sans text-[10px] tracking-wider uppercase font-bold">Password Updated</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          New Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] tracking-widest text-brand-brown uppercase font-bold block mb-1">
                          Confirm Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full text-xs pl-10 pr-3 py-2.5 border border-gray-200 focus:outline-none focus:border-brand-gold text-text-dark bg-bg-cream/20 font-sans"
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-brown font-sans text-xs font-bold tracking-[0.2em] py-3.5 uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer animate-shimmer pt-2.5"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          'Reset & Sign In'
                        )}
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
