'use client';

import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';
import { useState, useEffect, useRef } from 'react';

/* ─── hook: fires once when element enters viewport ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── fade-in wrapper ─── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function PricingPage() {
  const [activeNav, setActiveNav] = useState('pricing');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: 'Trial',
      subtitle: 'Entry-level for testing',
      price: '₹999',
      period: '/mo',
      features: ['10 Leads', '3 Listings', 'Basic CRM access'],
      cta: 'Start Free',
      featured: false,
      dark: false,
    },
    {
      name: 'Smart Growth',
      subtitle: 'For growing businesses',
      price: '₹9,999',
      period: '/mo',
      features: ['120 Leads', 'Priority listing', 'Buyer visibility', 'Insights access'],
      cta: 'Select Plan',
      featured: false,
      dark: false,
    },
    {
      name: 'Pro Trade Boost',
      subtitle: 'Core premium plan',
      price: '₹19,999',
      period: '/mo',
      features: ['250+ Leads', 'Verified network access', 'RM assigned', 'Executive connections'],
      cta: 'Get Started Now',
      featured: true,
      dark: false,
    },
    {
      name: 'Business Boost',
      subtitle: 'High-touch service',
      price: '₹35,999',
      period: '/mo',
      features: ['330+ Leads', 'Dedicated account manager', 'Matchmaking support', 'Campaign integration'],
      cta: 'Scale Up',
      featured: false,
      dark: false,
    },
    {
      name: 'Enterprise',
      subtitle: 'Top-tier solution',
      price: '₹60,000',
      period: '/mo',
      features: ['500 Leads', 'International consulting', 'Offline matchmaking', 'Custom integrations', 'Dedicated manager'],
      cta: 'Contact Sales',
      featured: false,
      dark: true,
    },
  ];

  const faqs = [
    {
      q: 'How does billing work?',
      a: 'We bill monthly or annually. Annual plans come with a 20% discount. All payments are processed securely through our encrypted payment gateway.',
    },
    {
      q: 'Can I change plans at any time?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, and you\'ll be prorated if upgrading mid-cycle.',
    },
    {
      q: 'What are GST verification checks?',
      a: 'GST verification checks are automated compliance checks that verify your trading counterparty\'s GST registration, filing history, and legitimacy before executing any deal.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark font-sans overflow-x-hidden text-on-surface dark:text-white transition-colors duration-300">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-btn { background-size:200% auto; background-image:linear-gradient(90deg,#ea580c 0%,#f97316 40%,#fb923c 60%,#ea580c 100%); animation:shimmer 2.5s linear infinite; }
        .bg-primary-gradient { background: linear-gradient(135deg, #e55a24 0%, #ff6b35 50%, #ff9500 100%); }
        .pricing-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .pricing-card:hover { transform: translateY(-4px) scale(1.02); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; }
        .faq-answer.open { max-height: 200px; }
        .featured-card { transform: scale(1.05); }
        .featured-card:hover { transform: scale(1.07); }
      `}</style>

      <TopNavbar activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="pt-32 pb-24">
        {/* ══ HERO SECTION ══ */}
        <FadeIn>
          <section className="max-w-7xl mx-auto px-8 text-center mb-20">
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-on-surface dark:text-white">
              Flexible Plans for <span className="text-primary">Global Trade Leaders.</span>
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-slate-300 max-w-2xl mx-auto">
              Select a plan tailored to your execution scale. All plans include 256-bit encryption and GST verification checks as standard.
            </p>
          </section>
        </FadeIn>

        {/* ══ PRICING GRID ══ */}
        <section className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 80}>
              <div
                className={`p-8 rounded-xl flex flex-col justify-between h-full ${
                  plan.featured
                    ? 'featured-card relative bg-white dark:bg-slate-800 shadow-2xl ring-2 ring-primary z-10'
                    : 'pricing-card bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-700'
                }`}
                style={plan.featured ? { boxShadow: '0 25px 50px rgba(255,107,53,.2)' } : {}}
              >
                {/* Recommended badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                    Recommended
                  </div>
                )}

                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">{plan.subtitle}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-on-surface dark:text-white">{plan.price}</span>
                    <span className="text-on-surface-variant dark:text-slate-400 text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${plan.featured ? (j === 0 ? 'text-on-surface dark:text-white font-semibold' : 'text-on-surface dark:text-white') : 'text-on-surface-variant dark:text-slate-300'}`}>
                        {plan.featured && j === 0 ? (
                          <span className="material-symbols-outlined notranslate text-primary text-lg filled" translate="no" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        ) : (
                          <span className="material-symbols-outlined notranslate text-primary text-lg" translate="no">check_circle</span>
                        )}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                {plan.featured ? (
                  <button className="w-full py-4 px-4 rounded-full bg-primary-gradient text-white font-headline font-bold shadow-lg hover:scale-[1.03] transition-transform"
                    style={{ boxShadow: '0 8px 24px rgba(255,107,53,.3)' }}>
                    {plan.cta}
                  </button>
                ) : plan.dark ? (
                  <button className="w-full py-3 px-4 rounded-full text-white font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                    {plan.cta}
                  </button>
                ) : (
                  <button className="w-full py-3 px-4 rounded-full border border-outline-variant dark:border-slate-600 text-primary font-bold hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors">
                    {plan.cta}
                  </button>
                )}
              </div>
            </FadeIn>
          ))}
        </section>

        {/* ══ SECURITY / TRUST HIGHLIGHTS ══ */}
        <section className="mt-24 max-w-5xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <FadeIn>
            <div className="bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-8 rounded-2xl flex items-start gap-4 transition-colors">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined notranslate text-primary text-3xl" translate="no">shield</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface dark:text-white text-lg mb-1">Institutional Security</h4>
                <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed">Enterprise-grade 256-bit AES encryption protecting every byte of your trade data.</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-8 rounded-2xl flex items-start gap-4 transition-colors">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined notranslate text-primary text-3xl" translate="no">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface dark:text-white text-lg mb-1">Compliance Guaranteed</h4>
                <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed">Integrated GST and KYC verification checks for every counterparty on the platform.</p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ══ FAQ ACCORDION ══ */}
        <section className="mt-32 max-w-3xl mx-auto px-8">
          <FadeIn>
            <h2 className="font-headline text-3xl font-extrabold text-center mb-12 text-on-surface dark:text-white">Frequently Asked Questions</h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-outline-variant dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/60 transition-colors">
                  <div
                    className="px-8 py-5 flex justify-between items-center cursor-pointer hover:bg-orange-50/50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-on-surface dark:text-white">{faq.q}</span>
                    <span
                      className="material-symbols-outlined notranslate text-on-surface-variant dark:text-slate-400 transition-transform duration-300" translate="no"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </div>
                  <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}
                    style={{ maxHeight: openFaq === i ? '200px' : '0', padding: openFaq === i ? '0 2rem 1.5rem 2rem' : '0 2rem' }}>
                    <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ══ FINAL CTA BANNER ══ */}
        <section className="mt-32 max-w-7xl mx-auto px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl py-20 px-12 text-center text-white bg-slate-900 dark:bg-slate-950 border dark:border-slate-800 transition-colors">
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(249,115,22,.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(255,149,0,.12) 0%, transparent 60%)' }} />

              <div className="relative z-10">
                <h2 className="font-headline text-4xl font-extrabold mb-6">Start closing deals today.</h2>
                <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">Join the 10,000+ trade leaders executing global transactions with Karm Baba.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/onboarding"
                    className="shimmer-btn text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-orange-900/30"
                  >
                    Get Started Now
                  </Link>
                  <button className="backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-white/20 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    View Enterprise Demo
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="w-full py-12 border-t border-slate-800 bg-background-dark">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="text-lg font-bold text-primary font-headline">KARM BABA</div>
          <div className="flex gap-8">
            <Link className="text-white/40 hover:text-primary transition-colors text-sm" href="#">Privacy</Link>
            <Link className="text-white/40 hover:text-primary transition-colors text-sm" href="#">Terms</Link>
            <Link className="text-white/40 hover:text-primary transition-colors text-sm" href="#">Support</Link>
          </div>
          <div className="text-white/25 text-sm">&copy; 2024 KARM BABA. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
