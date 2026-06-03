"use client";
import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import FadeInUp from '@/components/global/FadeInUp';

export default function Newsletter({ name }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Thank you for joining our family!');
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 md:py-20 bg-bg-cream border-t border-gray-100">
      <div className="max-w-480 mx-auto px-4 md:px-16 lg:px-24 text-center">

        <FadeInUp>
          {/* Decorative label */}
          <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">
            Exclusive Offers &amp; New Arrivals
          </p>
          <h2 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-brand-brown mb-3 tracking-wide">
            {name || "Join Our MIP Family"}
          </h2>
          <p className="font-primary text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Subscribe to receive early access to collections, festive offers, and jewellery care tips.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          {message ? (
            <div className="inline-flex items-center gap-2 font-primary text-brand-brown text-sm tracking-wide border border-brand-gold/40 bg-white px-6 py-3 rounded-sm shadow-sm">
              <span className="text-brand-gold">✓</span> {message}
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch justify-center gap-0 shadow-md rounded-sm overflow-hidden"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1 min-w-0 px-5 py-4 bg-white border border-brand-gold/30 sm:border-r-0 focus:border-brand-gold focus:outline-none text-brand-brown font-primary text-sm tracking-wide placeholder:text-gray-400/80 transition-colors disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 whitespace-nowrap bg-linear-to-r from-[#A68244] to-[#B89758] hover:from-brand-brown hover:to-[#5c4335] text-white font-primary text-xs font-semibold tracking-[0.18em] uppercase px-8 py-4 flex items-center justify-center gap-2 transition-all duration-300 group cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                  {!loading && <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </form>
              {error && (
                <p className="mt-3 text-red-500 font-primary text-xs text-center tracking-wide">
                  {error}
                </p>
              )}
            </div>
          )}
        </FadeInUp>

      </div>
    </section>
  );
}
