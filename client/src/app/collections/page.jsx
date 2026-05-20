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
      {/* Page Header */}
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-16 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">MIP Jewellers</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">Our Collections</h1>
        <p className="font-sans text-gray-500 text-sm mt-3 max-w-md mx-auto">
          Discover timeless jewellery crafted with 916 BIS Hallmarked gold and IGI-certified diamonds.
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">Collections</li>
        </ol>
      </nav>

      {/* Categories Grid */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-16 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {categories.map((cat, idx) => (
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
              <p className="font-sans text-[11px] text-gray-400 tracking-wider uppercase">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
