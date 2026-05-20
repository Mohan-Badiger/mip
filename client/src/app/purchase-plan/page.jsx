import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/global/PageLayout';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: 'Purchase Plan | MIP Jewellers – Kanaka Plus & Shreyas Schemes',
  description: 'Start your jewellery savings journey with MIP\'s EMA purchase plans. Save monthly and redeem in gold, diamonds, or platinum.',
};

const plans = [
  {
    name: 'Kanaka Plus',
    tag: 'One-Time Investment',
    desc: 'Make a single lump-sum deposit and redeem it in Gold or Silver jewellery with zero making charges. Also redeemable in Diamond and Platinum jewellery at additional value.',
    minAmount: '₹10,000',
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
    minAmount: '₹1,000/month',
    tenure: '12 Months',
    benefits: ['Start from just ₹1,000/month', 'MIP adds a bonus month on maturity', 'Choose from entire jewellery range', 'No lock-in; flexible redemption'],
    color: 'bg-bg-cream',
    textColor: 'text-brand-brown',
    accentColor: 'text-brand-gold',
  },
];

const steps = [
  { step: '01', title: 'Enrol', desc: 'Visit any MIP showroom or enrol online. Choose the plan that suits your budget.' },
  { step: '02', title: 'Save', desc: 'Make your monthly contributions or lump-sum deposit. Track your savings online.' },
  { step: '03', title: 'Mature', desc: 'At the end of your plan tenure, your account matures. MIP adds bonus value.' },
  { step: '04', title: 'Redeem', desc: 'Visit any MIP showroom and pick your favourite jewellery. No making charges on select categories.' },
];

export default function PurchasePlanPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-bg-cream border-b border-gray-100 py-10 md:py-16 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-2">Smart Jewellery Savings</p>
        <h1 className="font-secondary text-4xl md:text-5xl text-brand-brown tracking-wide">Purchase Plans</h1>
        <p className="font-sans text-gray-500 text-sm mt-3 max-w-lg mx-auto">
          MIP's jewellery savings plans let you invest systematically and redeem in your dream jewellery — with bonus value and zero making charges.
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="max-w-[1920px] mx-auto px-4 md:px-16 py-4 border-b border-gray-100">
        <ol className="flex items-center gap-2 text-[11px] font-sans text-gray-400 tracking-wide">
          <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-brand-brown">Purchase Plans</li>
        </ol>
      </nav>

      {/* Plans */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-16 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`${plan.color} border border-brand-gold/20 p-8 md:p-10 flex flex-col`}>
              <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-gold mb-3">{plan.tag}</span>
              <h2 className={`font-secondary text-3xl md:text-4xl ${plan.textColor} mb-4`}>{plan.name}</h2>
              <p className={`font-sans text-sm ${plan.name === 'Kanaka Plus' ? 'text-white/80' : 'text-gray-500'} leading-relaxed mb-6`}>{plan.desc}</p>
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-gold mb-1">Min. Amount</p>
                  <p className={`font-secondary text-xl ${plan.textColor}`}>{plan.minAmount}</p>
                </div>
                <div>
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-gold mb-1">Tenure</p>
                  <p className={`font-secondary text-xl ${plan.textColor}`}>{plan.tenure}</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className={`font-sans text-sm ${plan.name === 'Kanaka Plus' ? 'text-white/85' : 'text-gray-600'}`}>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/stores"
                className={`inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-[0.2em] uppercase pb-1 border-b transition-colors ${plan.name === 'Kanaka Plus' ? 'text-white border-white/40 hover:border-brand-gold hover:text-brand-gold' : 'text-brand-brown border-brand-gold hover:text-brand-gold'}`}
              >
                Enrol Now <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-bg-cream border-y border-gray-100 py-14 md:py-20">
        <div className="max-w-[1920px] mx-auto px-4 md:px-16">
          <div className="text-center mb-12">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Simple Steps</p>
            <h2 className="font-secondary text-3xl md:text-4xl text-brand-brown">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <p className="font-secondary text-4xl text-brand-gold/30 mb-3">{s.step}</p>
                <h3 className="font-secondary text-xl text-brand-brown mb-2">{s.title}</h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="relative overflow-hidden">
        <div className="bg-brand-brown py-14 md:py-16 px-4 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1920px] mx-auto">
          <div className="text-center md:text-left">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-3">Ready to Begin?</p>
            <h2 className="font-secondary text-3xl md:text-4xl text-white mb-2">Start Your Jewellery Savings Today</h2>
            <p className="font-sans text-white/70 text-sm max-w-md leading-relaxed">Visit any MIP showroom or call us to enrol. Our team will help you choose the right plan.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/stores" className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-white border border-white/40 hover:border-brand-gold hover:text-brand-gold px-8 py-4 transition-colors text-center">
              Find a Store
            </Link>
            <a href="tel:18001201925" className="font-sans text-xs font-semibold tracking-[0.2em] uppercase bg-brand-gold hover:bg-brand-gold-light text-white px-8 py-4 transition-colors text-center">
              Call 1800-120-1925
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
