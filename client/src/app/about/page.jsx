import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/global/PageLayout';

export const metadata = {
  title: 'About Us | MIP Jewellers – A Legacy Since 1925',
  description: 'Discover the story of MIP Jewellers — a century of trust, purity, and master craftsmanship since 1925.',
};

const milestones = [
  { year: '1925', text: 'MIP Jewellers founded in Kerala with a vision of purity and trust.' },
  { year: '1960', text: 'Expanded to 5 showrooms across Kerala, becoming a household name.' },
  { year: '1991', text: 'First in the region to adopt BIS Hallmarking for all gold jewellery.' },
  { year: '2005', text: 'Launched diamond jewellery with IGI certification, setting industry standards.' },
  { year: '2015', text: 'Opened flagship showroom in Kochi — 30,000 sq ft of curated luxury.' },
  { year: '2024', text: 'Launched MIP Online, bringing hallmarked jewellery to every home in India.' },
];

const values = [
  { title: 'BIS 916 Hallmarked Gold', desc: 'Every piece carries a unique HUID for purity verification. No compromise, ever.' },
  { title: 'IGI & GIA Certified Diamonds', desc: 'Our diamonds are independently graded and certified for cut, clarity, colour, and carat.' },
  { title: 'Full Transparency', desc: 'We provide a complete breakup of gold weight, stone weight, and making charges with every purchase.' },
  { title: 'Lifetime Exchange', desc: 'Your trust is our commitment. Exchange any MIP jewellery at any time with zero hassle.' },
];

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative w-full h-[340px] md:h-[480px] overflow-hidden">
        <Image src="/images/luxury_gold_hero_1779199654262.png" alt="MIP Jewellers Heritage" fill sizes="100vw" className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-brand-brown/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-brand-gold mb-3">Since 1925</p>
          <h1 className="font-secondary text-4xl md:text-6xl text-white leading-tight mb-4">A Legacy of Purity</h1>
          <p className="font-sans text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
            A century of trust, tradition, and timeless craftsmanship — woven into every piece we create.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">About Us</li>
        </ol>
      </nav>

      {/* Our Story */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Our Story</p>
            <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown mb-6 leading-tight">
              Started with a Promise,<br />Built on Trust
            </h2>
            <div className="font-sans text-gray-500 text-sm md:text-base leading-relaxed space-y-4">
              <p>In 1925, our founder walked into a small workshop in Kerala with a single conviction: jewellery should be pure, beautiful, and honestly priced. Nearly a century later, that conviction remains the heartbeat of MIP Jewellers.</p>
              <p>{"What began as a single store has grown into one of South India's most trusted jewellery destinations — with thousands of designs, dozens of showrooms, and millions of happy families who have chosen MIP for their most precious moments."}</p>
              <p>We have existed since 1925. Need we say more? Would it have been possible without the unwavering trust of generations?</p>
            </div>
          </div>
          <div className="relative h-[420px] md:h-[520px]">
            <Image src="/images/exquisite_model_1779203407757.png" alt="MIP Craftsmanship" fill sizes="50vw" className="object-cover object-top" />
            <div className="absolute -bottom-6 -left-6 bg-brand-brown text-white p-6 w-40 text-center hidden md:block">
              <p className="font-secondary text-4xl text-brand-gold">99+</p>
              <p className="font-sans text-[10px] tracking-widest uppercase text-white/80 mt-1">Years of Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bg-cream border-y border-gray-100 py-16 md:py-20">
        <div className="max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24">
          <div className="text-center mb-12">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Our Promise</p>
            <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown">Why Choose MIP?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ title, desc }) => (
              <div key={title} className="bg-white p-6 border border-gray-100">
                <div className="w-8 h-0.5 bg-brand-gold mb-5" />
                <h3 className="font-secondary text-xl text-brand-brown mb-3">{title}</h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-16 lg:px-24 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Our Journey</p>
          <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown">A Century of Milestones</h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-brand-gold/20 -translate-x-1/2" />
          <div className="space-y-8 md:space-y-0">
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <p className="font-secondary text-3xl text-brand-gold mb-1">{m.year}</p>
                  <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-sm mx-auto md:mx-0 md:ml-auto">{m.text}</p>
                </div>
                <div className="hidden md:flex w-4 h-4 rounded-full bg-brand-gold shrink-0 relative z-10" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-brown py-14 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Visit Us</p>
        <h2 className="font-secondary text-3xl md:text-4xl text-white mb-6">Experience MIP In Person</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/stores" className="inline-block font-sans text-xs font-semibold tracking-[0.2em] uppercase text-white border border-white/40 hover:border-brand-gold hover:text-brand-gold px-8 py-3.5 transition-colors">
            Find a Store
          </Link>
          <Link href="/collections" className="inline-block font-sans text-xs font-semibold tracking-[0.2em] uppercase bg-brand-gold hover:bg-brand-gold-light text-white px-8 py-3.5 transition-colors">
            Shop Online
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
