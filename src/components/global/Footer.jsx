import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brand-brown text-white/80 py-16">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h4 className="text-brand-gold font-secondary text-xl tracking-[0.2em] mb-6">Mip</h4>
            <p className="text-sm font-sans leading-relaxed text-white/70">
              A Legacy of Purity Since 1925. Crafted with devotion, our 916 BIS Hallmarked jewellery blends timeless heritage with modern sophistication.
            </p>
          </div>
          <div>
            <h5 className="text-white font-sans tracking-[0.2em] text-[10px] mb-6 uppercase">Useful Links</h5>
            <ul className="space-y-4 text-sm font-sans">
              <li><a href="#" className="hover:text-brand-gold transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Our Stores</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Jewellery Purchase Plan</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Gift Cards</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-sans tracking-[0.2em] text-[10px] mb-6 uppercase">Policies</h5>
            <ul className="space-y-4 text-sm font-sans">
              <li><a href="#" className="hover:text-brand-gold transition-colors">Shipping & Return</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-sans tracking-[0.2em] text-[10px] mb-6 uppercase">Contact Us</h5>
            <ul className="space-y-4 text-sm font-sans">
              <li>Toll Free: <a href="tel:18001201925" className="text-white hover:text-brand-gold transition-colors">1800-120-1925</a></li>
              <li>Email: <a href="mailto:support@mip.com" className="text-white hover:text-brand-gold transition-colors">support@mip.com</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-xs font-sans text-white/50">
          <p>&copy; {new Date().getFullYear()} mip. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
