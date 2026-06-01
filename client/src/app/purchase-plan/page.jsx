import Link from 'next/link';
import PageLayout from '@/components/global/PageLayout';
import PurchasePlanClient from './PurchasePlanClient';

export const metadata = {
  title: 'Purchase Plan | MIP Jewellers – Kanaka Plus & Shreyas Schemes',
  description: 'Start your jewellery savings journey with MIP\'s EMA purchase plans. Save monthly and redeem in gold, diamonds, or platinum.',
};

export default function PurchasePlanPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-16 text-center">
        <p className="font-primary text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">Smart Jewellery Savings</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">Purchase Plans</h1>
        <p className="font-primary text-gray-500 text-sm mt-3 max-w-lg mx-auto">
          {"MIP's jewellery savings plans let you invest systematically and redeem in your dream jewellery — with bonus value and zero making charges."}
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-480 mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-primary text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">Purchase Plans</li>
        </ol>
      </nav>

      {/* Dynamic Client Flow */}
      <PurchasePlanClient />
    </PageLayout>
  );
}
