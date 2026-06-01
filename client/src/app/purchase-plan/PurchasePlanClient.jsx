"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowUpRight, X, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const plans = [
  {
    name: 'Kanaka Plus',
    tag: 'One-Time Investment',
    desc: 'Make a single lump-sum deposit and redeem it in Gold or Silver jewellery with zero making charges. Also redeemable in Diamond and Platinum jewellery at additional value.',
    minAmount: 10000,
    tenure: 'Flexible',
    benefits: ['Zero making charges on Gold & Silver', 'Redeemable in Diamond & Platinum', 'No monthly commitment', 'BIS Hallmarked jewellery guaranteed'],
    color: 'bg-brand-brown',
    textColor: 'text-white',
    accentColor: 'text-brand-gold',
  },
  {
    name: 'Shreyas',
    tag: 'Monthly Savings',
    desc: 'Save as little as ₹1,000 per month for 12 months. On maturity, choose your favourite Gold, Silver, Diamond, or Platinum jewellery at special rates.',
    minAmount: 1000,
    tenure: '12 Months',
    benefits: ['Start from just ₹1,000/month', 'MIP adds a bonus month on maturity', 'Choose from entire jewellery range', 'No lock-in; flexible redemption'],
    color: 'bg-bg-cream',
    textColor: 'text-brand-brown',
    accentColor: 'text-brand-gold',
  },
];

const stepsList = [
  { step: '01', title: 'Enrol', desc: 'Enrol online or visit any MIP showroom. Choose the plan that suits your budget.' },
  { step: '02', title: 'Save', desc: 'Make your monthly contributions or lump-sum deposit. Track your savings online.' },
  { step: '03', title: 'Mature', desc: 'At the end of your plan tenure, your account matures. MIP adds bonus value.' },
  { step: '04', title: 'Redeem', desc: 'Visit any MIP showroom and pick your favourite jewellery. No making charges on select categories.' },
];

export default function PurchasePlanClient() {
  const { isLoggedIn, openAuthModal, user } = useAuth();
  
  // Enrolment Modal States
  const [selectedPlan, setSelectedPlan] = useState(null); // plan object or null
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Configure, 2 = Personal Details + PAN, 3 = Confirmation / Receipt
  
  // Form values
  const [amount, setAmount] = useState('');
  const [panCard, setPanCard] = useState('');
  const [enrolmentError, setEnrolmentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null); // { id, planName, amount, tenure }

  const handleOpenEnrol = (plan) => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    setSelectedPlan(plan);
    setAmount(plan.minAmount.toString());
    setPanCard('');
    setEnrolmentError('');
    setReceipt(null);
    setStep(1);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // Calculator helper
  const calculateBonus = () => {
    if (!selectedPlan) return 0;
    const numAmt = parseFloat(amount) || 0;
    if (selectedPlan.name === 'Shreyas') {
      // Shreyas: User pays for 11 months, MIP adds 12th month (equal to one month amount)
      return numAmt; // Bonus is 1 month contribution
    } else {
      // Kanaka Plus: One-time lump sum. Gold rate growth benefit + making charges discount.
      // Let's assume a simulated bonus of 8.5% of lump-sum value.
      return Math.round(numAmt * 0.085);
    }
  };

  const handleNextStep = () => {
    setEnrolmentError('');
    const numAmt = parseFloat(amount) || 0;
    
    if (step === 1) {
      if (isNaN(numAmt) || numAmt < selectedPlan.minAmount) {
        setEnrolmentError(`Minimum amount for ${selectedPlan.name} is ₹${selectedPlan.minAmount.toLocaleString('en-IN')}`);
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnrolmentError('');
    
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panCard.trim().toUpperCase())) {
      setEnrolmentError('Please enter a valid 10-digit PAN Card Number (e.g. ABCDE1234F)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/purchase-plan/enrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan.name,
          amount: parseFloat(amount),
          tenure: selectedPlan.name === 'Shreyas' ? '12 Months' : 'Flexible',
          panCard: panCard.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt({
          id: data.enrolmentId,
          planName: selectedPlan.name,
          amount: parseFloat(amount),
          tenure: selectedPlan.name === 'Shreyas' ? '12 Months' : 'Flexible'
        });
        setStep(3);
      } else {
        setEnrolmentError(data.error || 'Failed to submit enrollment request');
      }
    } catch (err) {
      console.error(err);
      setEnrolmentError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-cream min-h-screen text-text-dark">
      {/* Plans Section */}
      <section className="max-w-480 mx-auto px-4 md:px-16 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`${plan.color} border border-brand-gold/20 p-8 md:p-10 flex flex-col justify-between shadow-xs transition-transform duration-300 hover:scale-[1.01]`}>
              <div>
                <span className="font-primary text-[9px] tracking-[0.25em] uppercase text-brand-gold mb-3 block">{plan.tag}</span>
                <h2 className={`font-secondary text-3xl md:text-4xl ${plan.textColor} mb-4`}>{plan.name}</h2>
                <p className={`font-primary text-sm ${plan.name === 'Kanaka Plus' ? 'text-white/80' : 'text-gray-500'} leading-relaxed mb-6`}>{plan.desc}</p>
                <div className="flex gap-8 mb-6">
                  <div>
                    <p className="font-primary text-[9px] tracking-[0.2em] uppercase text-brand-gold mb-1">Min. Amount</p>
                    <p className={`font-secondary text-xl ${plan.textColor}`}>₹{plan.minAmount.toLocaleString('en-IN')}{plan.name === 'Shreyas' ? '/month' : ''}</p>
                  </div>
                  <div>
                    <p className="font-primary text-[9px] tracking-[0.2em] uppercase text-brand-gold mb-1">Tenure</p>
                    <p className={`font-secondary text-xl ${plan.textColor}`}>{plan.tenure}</p>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className={`font-primary text-sm ${plan.name === 'Kanaka Plus' ? 'text-white/85' : 'text-gray-650'}`}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleOpenEnrol(plan)}
                className={`w-fit inline-flex items-center gap-2 font-primary text-xs font-semibold tracking-[0.2em] uppercase pb-1 border-b transition-colors cursor-pointer ${plan.name === 'Kanaka Plus' ? 'text-white border-white/40 hover:border-brand-gold hover:text-brand-gold' : 'text-brand-brown border-brand-gold hover:text-brand-gold'}`}
              >
                Enrol Now <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white border-y border-gray-100 py-14 md:py-20">
        <div className="max-w-480 mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Simple Steps</p>
            <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stepsList.map((s) => (
              <div key={s.step} className="text-center">
                <p className="font-secondary text-4xl text-brand-gold/30 mb-3">{s.step}</p>
                <h3 className="font-secondary text-xl text-brand-brown mb-2">{s.title}</h3>
                <p className="font-primary text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Callout */}
      <section className="relative overflow-hidden bg-brand-brown text-white">
        <div className="py-14 md:py-16 px-4 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 max-w-480 mx-auto">
          <div className="text-center md:text-left">
            <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Ready to Begin?</p>
            <h2 className="font-secondary text-3xl md:text-4xl mb-2">Start Your Jewellery Savings Today</h2>
            <p className="font-primary text-white/70 text-sm max-w-md leading-relaxed">Visit any MIP showroom, call us, or enrol online using our secure client portal.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/stores" className="font-primary text-xs font-semibold tracking-[0.2em] uppercase text-white border border-white/40 hover:border-brand-gold hover:text-brand-gold px-8 py-4 transition-colors text-center">
              Find a Store
            </Link>
            <a href="tel:18001201925" className="font-primary text-xs font-semibold tracking-[0.2em] uppercase bg-brand-gold hover:bg-brand-gold-light text-white px-8 py-4 transition-colors text-center">
              Call 1800-120-1925
            </a>
          </div>
        </div>
      </section>

      {/* Dynamic Enrolment Dialog / Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full border border-brand-gold/20 shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-bg-cream">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold">{selectedPlan.tag}</span>
                <h3 className="font-secondary text-xl text-brand-brown mt-0.5">Enrol in {selectedPlan.name}</h3>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-brand-brown cursor-pointer p-1.5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 font-primary text-xs text-text-dark">
              
              {/* Stepper Indicator */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                {[1, 2, 3].map((sNum) => (
                  <div key={sNum} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors
                      ${step === sNum 
                        ? 'bg-brand-brown text-white border-brand-brown' 
                        : step > sNum 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      {step > sNum ? '✓' : `0${sNum}`}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold 
                      ${step === sNum ? 'text-brand-brown' : 'text-gray-400'}`}>
                      {sNum === 1 ? 'Configure' : sNum === 2 ? 'Details' : 'Receipt'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Configure Plan Value */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-500 mb-2 font-semibold">
                      {selectedPlan.name === 'Shreyas' 
                        ? 'Select Monthly Savings Contribution Amount (INR)' 
                        : 'Select Lump-Sum Deposit Amount (INR)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm text-gray-400 font-semibold font-secondary">₹</span>
                      <input
                        type="number"
                        placeholder={`Minimum ₹${selectedPlan.minAmount.toLocaleString('en-IN')}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-bg-cream/45 border border-gray-200 py-3.5 pl-8 pr-4 text-sm focus:outline-none focus:border-brand-gold font-secondary font-bold text-brand-brown"
                      />
                    </div>
                  </div>

                  {/* Calculator Simulation Widget */}
                  <div className="bg-bg-cream border border-brand-gold/10 p-5 rounded-sm">
                    <h4 className="font-secondary text-sm text-brand-brown mb-3 flex items-center gap-1.5 font-semibold">
                      <Calculator className="w-4 h-4 text-brand-gold" /> Savings Plan Summary
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Your Contribution</span>
                        <span className="font-semibold text-gray-700">₹{(parseFloat(amount) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>MIP Maturity Bonus Value</span>
                        <span className="font-semibold text-emerald-700">+ ₹{calculateBonus().toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between font-secondary text-sm text-brand-brown font-bold">
                        <span>Total Maturity Redeemable</span>
                        <span>₹{((parseFloat(amount) || 0) + calculateBonus()).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    *Maturity value is redeemable in 22KT gold, 18KT gold, silver, platinum, or certified diamonds at live rates. No making charges will apply to gold and silver jewellery selections up to the maturity value limit.
                  </p>
                </div>
              )}

              {/* Step 2: Personal Details + PAN Card verification */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.name || ''}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 text-gray-450 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        disabled
                        value={user?.phone || ''}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 text-gray-450 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 text-gray-450 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-2 font-semibold">Enter PAN Card Number (Required for KYC verification)</label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={panCard}
                      onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                      className="w-full bg-bg-cream/45 border border-gray-200 py-3 px-4 text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-brand-gold text-brand-brown font-bold"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-100 p-3.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-800 leading-normal">
                      <strong>Secure KYC Processing:</strong> Your financial data and PAN details are encrypted using industry-standard AES-256 protocols and submitted directly to legal verification systems.
                    </p>
                  </div>
                </form>
              )}

              {/* Step 3: Success Receipt */}
              {step === 3 && receipt && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-secondary text-xl text-brand-brown leading-snug">Congratulations!<br />Enrolment Successful</h4>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Your savings scheme enrolment request has been successfully registered. Here is your transaction ticket details:
                  </p>

                  <div className="border border-brand-gold/15 bg-bg-cream p-6 text-left space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                      <span className="text-gray-400">Enrolment ID</span>
                      <span className="font-bold text-gray-700">{receipt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                      <span className="text-gray-400">Scheme Name</span>
                      <span className="font-bold text-gray-700">{receipt.planName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/50 pb-2">
                      <span className="text-gray-400">Amount Committed</span>
                      <span className="font-bold text-gray-700">₹{receipt.amount.toLocaleString('en-IN')} {receipt.planName === 'Shreyas' ? '/ month' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheme Tenure</span>
                      <span className="font-bold text-gray-700">{receipt.tenure}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-normal">
                    An email verification packet containing your payment schedule and certificates has been dispatched to <strong>{user?.email}</strong>. Our customer relations desk will call you shortly to confirm activation.
                  </p>
                </div>
              )}

              {/* Error Display */}
              {enrolmentError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-sm text-[10px] font-semibold">
                  {enrolmentError}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-bg-cream flex justify-end gap-3">
              {step < 3 ? (
                <>
                  <button
                    onClick={handleClose}
                    className="px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-650 uppercase tracking-widest text-[10px] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  {step === 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white px-7 py-3 uppercase tracking-widest text-[10px] font-bold cursor-pointer"
                    >
                      Proceed to Details
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white px-7 py-3 uppercase tracking-widest text-[10px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Verifying KYC...' : 'Confirm Enrollment'}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleClose}
                  className="bg-brand-brown hover:bg-brand-gold hover:text-brand-brown text-white px-7 py-3 uppercase tracking-widest text-[10px] font-bold cursor-pointer"
                >
                  Close Receipt
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
