"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/global/PageLayout';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const SUBJECTS = ['General Enquiry', 'Order Support', 'Purchase Plan', 'Jewellery Customisation', 'Store Feedback', 'Other'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-16 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">{"We're Here For You"}</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">Contact Us</h1>
        <p className="font-sans text-gray-500 text-sm mt-3">Reach out for anything — our team responds within 24 hours.</p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">Contact</li>
        </ol>
      </nav>

      <div className="max-w-[1920px] mx-auto px-4 md:px-16 py-12 md:py-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Left: Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-4">Get In Touch</p>
              <h2 className="font-secondary text-2xl md:text-3xl text-brand-brown mb-6 leading-tight">{"Let's Talk Jewellery"}</h2>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">
                {"Whether you have a question about our collections, need help with an order, or want to plan your dream jewellery — we're just a message away."}
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: Phone, label: 'Toll Free', value: '1800-120-1925', href: 'tel:18001201925' },
                { icon: Mail,  label: 'Email',     value: 'support@mip.com', href: 'mailto:support@mip.com' },
                { icon: MapPin, label: 'Head Office', value: 'Kochi, Kerala, India', href: null },
                { icon: Clock,  label: 'Hours',    value: 'Mon–Sun: 9:00 AM – 9:00 PM', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-3.5">
                  <div className="w-9 h-9 bg-bg-cream flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-400 mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="font-sans text-sm text-brand-brown hover:text-brand-gold transition-colors">{value}</a>
                    ) : (
                      <p className="font-sans text-sm text-brand-brown">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">Follow Us</p>
              <div className="flex gap-4">
                {['Instagram', 'Facebook', 'YouTube'].map((social) => (
                  <a key={social} href="#" className="font-sans text-xs text-brand-brown hover:text-brand-gold transition-colors">{social}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center gap-4">
                <CheckCircle2 className="w-14 h-14 text-brand-gold" strokeWidth={1} />
                <h3 className="font-secondary text-2xl text-brand-brown">Message Sent!</h3>
                <p className="font-sans text-sm text-gray-500 max-w-sm">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="font-sans text-xs text-brand-gold underline underline-offset-2 tracking-wide mt-2 hover:text-brand-brown transition-colors">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-500 block mb-1.5">Full Name *</label>
                    <input
                      required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-brand-gold focus:outline-none font-sans text-sm text-brand-brown placeholder:text-gray-300 bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-500 block mb-1.5">Email Address *</label>
                    <input
                      required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-brand-gold focus:outline-none font-sans text-sm text-brand-brown placeholder:text-gray-300 bg-white transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-500 block mb-1.5">Phone Number</label>
                    <input
                      type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-brand-gold focus:outline-none font-sans text-sm text-brand-brown placeholder:text-gray-300 bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-500 block mb-1.5">Subject</label>
                    <select
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-brand-gold focus:outline-none font-sans text-sm text-brand-brown bg-white transition-colors"
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-sans text-[9px] tracking-[0.2em] uppercase text-gray-500 block mb-1.5">Message *</label>
                  <textarea
                    required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-brand-gold focus:outline-none font-sans text-sm text-brand-brown placeholder:text-gray-300 bg-white transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-brand-brown hover:bg-brand-gold transition-colors text-white font-sans text-xs font-semibold tracking-[0.2em] uppercase px-10 py-4"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
