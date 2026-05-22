import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/global/PageLayout';
import { categories } from '@/lib/products';

export const metadata = {
  title: 'All Collections | MIP Jewellers',
  description: 'Explore MIP\'s complete range of handcrafted gold, diamond, and silver jewellery collections.',
};

export default function CollectionsPage() {
  return (
    <PageLayout>
      {/* Breadcrumb - Moved Above Hero */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 pt-[26px] pb-4 md:pt-7 md:pb-4">
        <ol className="flex items-center gap-2 text-[11px] font-primary text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown font-medium">Collections</li>
        </ol>
      </nav>

      {/* Page Header - Upgraded Hero Banner */}
      <div className="relative bg-[#0F0E0C] overflow-hidden h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] flex items-center border-b border-gray-900 mb-8">
        {/* Right side background image */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[50%] h-full">
          <Image
            src="/images/exquisite_model_1779203407757.png"
            alt="Our Collections"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-[2s] ease-out hover:scale-105"
          />
          {/* Gradient fade to seamlessly blend with the left dark background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0C] via-[#0F0E0C]/80 to-transparent" />
        </div>

        {/* Left side text content */}
        <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-16 w-full flex flex-col items-start text-left">
          <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-1.5 md:mb-2">MIP Jewellers</p>
          <h1 className="font-secondary text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight">
            Our Collections
          </h1>
          <p className="font-primary text-gray-300 text-xs md:text-sm mt-1.5 md:mt-2.5 max-w-[240px] sm:max-w-sm md:max-w-md lg:max-w-lg leading-relaxed">
            Discover timeless jewellery crafted with 916 BIS Hallmarked gold and IGI-certified diamonds.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-16 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/collections/${cat.slug}`} className="group">
              <div className="relative aspect-square w-full overflow-hidden bg-gray-50 mb-4">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors duration-500" />
              </div>
              <h2 className="font-secondary text-xl md:text-2xl text-brand-brown mb-1 group-hover:text-brand-gold transition-colors">
                {cat.label}
              </h2>
              <p className="font-primary text-[11px] text-gray-400 tracking-wider uppercase">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
