import Link from 'next/link';
import PageLayout from '@/components/global/PageLayout';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

export const metadata = {
  title: 'Store Locator | MIP Jewellers',
  description: 'Find your nearest MIP Jewellers showroom. Visit us to experience our complete jewellery collection in person.',
};

const stores = [
  {
    id: 1, city: 'Kochi', name: 'MIP Jewellers – Kochi Flagship',
    address: 'Ground Floor, Lulu Mall, Edapally, Kochi, Kerala 682024',
    phone: '0484-400-1925', hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
    tag: 'Flagship Store',
  },
  {
    id: 2, city: 'Kozhikode', name: 'MIP Jewellers – Kozhikode',
    address: 'SM Street, Kozhikode, Kerala 673001',
    phone: '0495-270-1925', hours: 'Mon–Sun: 9:30 AM – 8:30 PM',
    tag: null,
  },
  {
    id: 3, city: 'Thiruvananthapuram', name: 'MIP Jewellers – Trivandrum',
    address: 'MG Road, Statue Junction, Thiruvananthapuram, Kerala 695001',
    phone: '0471-230-1925', hours: 'Mon–Sun: 10:00 AM – 8:30 PM',
    tag: null,
  },
  {
    id: 4, city: 'Thrissur', name: 'MIP Jewellers – Thrissur',
    address: 'Round North, Thrissur, Kerala 680001',
    phone: '0487-244-1925', hours: 'Mon–Sat: 9:30 AM – 8:00 PM',
    tag: null,
  },
  {
    id: 5, city: 'Kannur', name: 'MIP Jewellers – Kannur',
    address: 'Fort Road, Kannur, Kerala 670001',
    phone: '0497-276-1925', hours: 'Mon–Sun: 10:00 AM – 8:30 PM',
    tag: null,
  },
  {
    id: 6, city: 'Bengaluru', name: 'MIP Jewellers – Bengaluru',
    address: 'Commercial Street, Shivajinagar, Bengaluru, Karnataka 560001',
    phone: '080-4100-1925', hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
    tag: 'New Store',
  },
];

const cities = ['All', ...Array.from(new Set(stores.map((s) => s.city)))];

export default function StoresPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-16 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">Find Us</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">Our Showrooms</h1>
        <p className="font-sans text-gray-500 text-sm mt-3">Visit any of our showrooms to experience MIP jewellery in person.</p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">Our Stores</li>
        </ol>
      </nav>

      <div className="max-w-[1920px] mx-auto px-4 md:px-16 py-12 pb-20">
        {/* Map Placeholder */}
        <div className="w-full h-[240px] md:h-[360px] bg-[#EDE8DC] rounded-sm mb-12 flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-brand-gold mx-auto mb-3" strokeWidth={1} />
            <p className="font-secondary text-xl text-brand-brown mb-1">Store Map</p>
            <p className="font-sans text-xs text-gray-400 tracking-wide">Google Maps integration coming soon</p>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="border border-gray-100 bg-white p-6 hover:border-brand-gold/40 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {store.tag && (
                    <span className="inline-block font-sans text-[9px] tracking-widest uppercase bg-brand-gold/10 text-brand-gold px-2 py-0.5 mb-2">
                      {store.tag}
                    </span>
                  )}
                  <h3 className="font-secondary text-lg text-brand-brown group-hover:text-brand-gold transition-colors">{store.name}</h3>
                </div>
              </div>
              <div className="space-y-3 font-sans text-sm text-gray-500">
                <div className="flex gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="leading-relaxed">{store.address}</span>
                </div>
                <div className="flex gap-2.5">
                  <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <a href={`tel:${store.phone.replace(/-/g, '')}`} className="hover:text-brand-brown transition-colors">{store.phone}</a>
                </div>
                <div className="flex gap-2.5">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>{store.hours}</span>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.15em] uppercase text-brand-brown hover:text-brand-gold transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Get Directions
              </a>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
