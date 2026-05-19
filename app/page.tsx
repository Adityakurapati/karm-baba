'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';

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

/* ─── animated counter ─── */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
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

function TestiCard({ name, role, content, company, country }: { name: string; role: string; content: string; company: string; country: string }) {
  return (
    <div className="w-[320px] bg-slate-800/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{name.charAt(0)}</div>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">{role} @ {company}</p>
        </div>
        <span className="ml-auto text-lg">🇮🇳</span>
      </div>
      <p className="text-white/70 text-sm leading-relaxed italic">&quot;{content}&quot;</p>
    </div>
  );
}

const row1 = [
  { name: "Rahul Sharma", role: "CEO", company: "IndoGlobal", country: "IN", content: "KARM BABA transformed our export pipeline. The verification speed is unmatched." },
  { name: "Ahmed Al-Farsi", role: "Director", company: "Zion Trade", country: "AE", content: "Finally, a platform that understands the complexity of cross-border logistics." },
  { name: "Sarah Jenkins", role: "Procurement", company: "ScaleUp Ltd", country: "UK", content: "The AI matching saved us weeks of manual supplier vetting. Exceptional tool." },
  { name: "Vikram Mehta", role: "Founder", company: "Mehta Ornaments", country: "IN", content: "Secure, fast, and transparent. The only way we do international business now." },
];

const row2 = [
  { name: "Chen Wei", role: "Supply Chain", company: "Nexus Mfg", country: "CN", content: "Integration with our existing ERP was seamless. Highly recommended for enterprise." },
  { name: "Elena Petrova", role: "COO", company: "EuroTrans", country: "RU", content: "The risk assessment modules are a game changer for high-value contracts." },
  { name: "Kofi Mensah", role: "Manager", company: "AgroFlow", country: "GH", content: "Connecting with verified buyers in Europe has never been this straightforward." },
  { name: "Anil Kapoor", role: "VP Trade", company: "Reliance Group", country: "IN", content: "Efficiency and trust are the core of KARM BABA. It's the gold standard." },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState('deals');
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [activePill, setActivePill] = useState(0);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  /* hero typewriter */
  const words = ['They Close.', 'They Deliver.', 'They Scale.'];
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const target = words[wordIdx];
    const delay = deleting ? 50 : 90;
    const timer = setTimeout(() => {
      if (!deleting) {
        if (displayed.length < target.length) setDisplayed(target.slice(0, displayed.length + 1));
        else setTimeout(() => setDeleting(true), 1800);
      } else {
        if (displayed.length > 0) setDisplayed(displayed.slice(0, -1));
        else { setDeleting(false); setWordIdx((wordIdx + 1) % words.length); }
      }
    }, delay);
    return () => clearTimeout(timer);
  });

  const industries = ['Agriculture', 'Automotive', 'Textile', 'Import-Export'];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-on-surface dark:text-white transition-colors duration-300 font-sans overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .hero-float { animation: float 5s ease-in-out infinite; }
        .hero-float-slow { animation: float 7s ease-in-out infinite; }
        .pulse-dot { position:relative; }
        .pulse-dot::after { content:''; position:absolute; inset:0; border-radius:50%; border:2px solid #f97316; animation:pulse-ring 1.8s ease-out infinite; }
        .shimmer-btn { background-size:200% auto; background-image:linear-gradient(90deg,#ea580c 0%,#f97316 40%,#fb923c 60%,#ea580c 100%); animation:shimmer 2.5s linear infinite; }
        .tier-card { transition:transform .3s ease, box-shadow .3s ease; }
        .tier-card:hover { transform:translateY(-6px); }
        .pill-tab { transition:all .25s ease; }
        .pill-tab.active { background:#f97316; color:#fff; border-color:#f97316; }
        .feature-card:hover { border-color:#f97316; box-shadow:0 12px 30px rgba(249,115,22,.1); transform:translateY(-3px); }
        .feature-card { transition:all .3s ease; }
        .industry-card:hover { border-color:#f97316; box-shadow:0 12px 30px rgba(249,115,22,.08); transform:translateY(-3px); }
        .industry-card { transition:all .3s ease; }
        .stat-glow { text-shadow:0 0 24px rgba(249,115,22,.4); }
      `}</style>

      <TopNavbar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* ══ HERO ══ */}
      <section
        className="relative pt-24 pb-20 px-6 md:px-12 overflow-hidden"
        style={{ background: 'linear-gradient(155deg,#fff7ed 0%,#fff 45%,#fef3e2 100%)' }}
      >
        {/* blobs */}
        <div className="absolute top-10 right-[6%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: '#f97316', opacity: 0.07, filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 left-[4%] w-56 h-56 rounded-full pointer-events-none"
          style={{ background: '#fb923c', opacity: 0.06, filter: 'blur(55px)' }} />

        {/* floating stat cards */}
        <div className="hero-float absolute top-32 right-[3%] hidden xl:flex flex-col gap-1 p-4 bg-white rounded-2xl border border-orange-100 w-44"
          style={{ boxShadow: '0 8px 32px rgba(249,115,22,.15)', animationDelay: '0s' }}>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Live Deals</span>
          <span className="text-3xl font-black text-primary">2,847</span>
          <span className="text-xs text-green-600 font-bold">↑ +12% today</span>
        </div>
        <div className="hero-float-slow absolute bottom-20 right-[11%] hidden xl:flex flex-col gap-1 p-4 bg-white rounded-2xl border border-orange-100 w-44"
          style={{ boxShadow: '0 8px 32px rgba(249,115,22,.15)', animationDelay: '1.5s' }}>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Deal Volume</span>
          <span className="text-3xl font-black text-primary">$2B+</span>
          <span className="text-xs text-on-surface-variant">Verified trades</span>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* badge */}
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 border border-orange-200 bg-orange-50 text-primary">
            <span className="relative w-2 h-2 rounded-full bg-primary pulse-dot flex-shrink-0" />
            The Gold Standard for Global Trade
          </div>

          <h1 className="text-5xl md:text-6xl font-headline font-black tracking-tight text-on-surface leading-[1.1] mb-6">
            Where Business Deals Don&apos;t
            <br />
            Just Start —{' '}
            <span className="text-primary" style={{ display: 'inline-block', minWidth: '13ch' }}>
              {displayed}<span className="animate-pulse text-on-surface-variant/40">|</span>
            </span>
          </h1>

          <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
            B2B deal execution engine for serious businesses. Connect, verify, and execute
            high-value global trade requirements with KARM BABA precision.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="shimmer-btn px-8 py-3.5 text-white font-headline font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-200"
            >
              Start Selling →
            </Link>
            <Link
              href="/requirements"
              className="px-8 py-3.5 border-2 border-primary text-primary font-headline font-bold rounded-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all"
            >
              Post Requirement
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TRUST BAR ══ */}
      <section className="border-y border-orange-100 bg-white py-5 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'public', label: 'Global Trade' },
            { icon: 'package_2', label: 'Exporters Union' },
            { icon: 'factory', label: 'Manufacturers' },
            { icon: 'account_balance', label: 'Bank Secure' },
          ].map((item) => (
            <div key={item.label}
              className="flex items-center justify-center gap-2 text-on-surface-variant text-sm font-semibold py-2.5 px-3 rounded-xl hover:bg-orange-50 hover:text-primary transition-colors cursor-default">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {['GST Verified', 'Trusted Network', 'AI Screening'].map((badge) => (
            <span key={badge}
              className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all cursor-default flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span> {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-3xl md:text-4xl font-headline font-black text-on-surface">
              Engineered for Sovereign Architecture
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-11 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: 'linear-gradient(90deg,transparent,#f97316,transparent)' }} />

            {[
              { step: '01', icon: 'verified', title: 'Get Verified', desc: 'Identity and business validation through our rigorous trust protocol to ensure high-intent participation.', bg: 'bg-blue-50', border: 'border-blue-200', num: 'text-blue-600' },
              { step: '02', icon: 'hub', title: 'Get Matched', desc: 'Our execution engine matches your requirements with verified suppliers or buyers within minutes.', bg: 'bg-orange-50', border: 'border-orange-200', num: 'text-primary' },
              { step: '03', icon: 'handshake', title: 'Close Deals', desc: 'Facilitate secure negotiations, documentation, and payments all within the KARM BABA workspace.', bg: 'bg-violet-50', border: 'border-violet-200', num: 'text-violet-600' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 120} className="flex flex-col items-center text-center p-8 group">
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border-2 ${item.bg} ${item.border} group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  <span className={`absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white border-2 ${item.border} text-xs font-black flex items-center justify-center ${item.num}`}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INDUSTRY ECOSYSTEMS ══ */}
      <section className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Ecosystems</p>
            <h2 className="text-3xl font-headline font-black text-on-surface mb-6">
              Industry Specific Intelligence
            </h2>
          </FadeIn>

          <div className="flex gap-2 flex-wrap mb-6">
            {industries.map((ind, i) => (
              <button key={ind} onClick={() => setActivePill(i)}
                className={`pill-tab px-4 py-1.5 rounded-full text-sm font-bold border ${activePill === i ? 'active shadow-md shadow-orange-100' : 'border-outline-variant text-on-surface-variant bg-white hover:border-primary hover:text-primary'}`}>
                {ind}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { icon: 'agriculture', title: 'Agriculture', desc: 'Global supply chains for bulk grains, oils, and sustainable produce.', tag: 'Commodities' },
              { icon: 'directions_car', title: 'Automotive', desc: 'Precision parts and heavy vehicle trade across continents.', tag: 'Manufacturing' },
              { icon: 'apparel', title: 'Textile', desc: 'Industrial fabric and luxury garment sourcing at scale.', tag: 'Sourcing' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="industry-card p-6 bg-white rounded-2xl border border-outline-variant cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-primary border border-orange-100">{item.tag}</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="industry-card p-6 bg-white rounded-2xl border border-outline-variant flex items-center justify-between flex-wrap gap-4 cursor-default">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-3xl">ship</span>
                <div>
                  <h3 className="font-headline font-bold text-on-surface mb-0.5">Import-Export Services</h3>
                  <p className="text-on-surface-variant text-sm">Complete logistics, customs clearance, and trade financing for global commerce.</p>
                </div>
              </div>
              <Link href="/markets"
                className="px-5 py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-200 whitespace-nowrap">
                Explore All Markets →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ TRUST STATS ══ */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-4">
              Only verified,{' '}
              <span className="text-primary">high-value businesses</span>
            </h2>
            <p className="text-on-surface-variant mb-14 leading-relaxed max-w-xl mx-auto">
              We maintain the integrity of our network by vetting every member. No spam,
              no noise — just direct executive access to deals that matter.
            </p>
          </FadeIn>

          <div className="grid grid-cols-3 gap-8">
            {[
              { value: 94, suffix: '%', label: 'Close Rate' },
              { value: 2, suffix: 'B+', prefix: '$', label: 'Deal Volume' },
              { value: 50, suffix: '+', label: 'Countries' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 150}>
                <div className="text-4xl md:text-5xl font-headline font-black text-primary stat-glow mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} prefix={stat.prefix ?? ''} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURE GRID ══ */}
      <section className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-3xl font-headline font-black text-on-surface">Everything you need to win deals</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: 'task_alt', title: 'Smart Deal Matching', desc: 'AI-powered algorithm connects you with the right trade partners based on requirements.' },
              { icon: 'verified_user', title: 'Verified Network', desc: 'All traders and suppliers go through rigorous verification for security and trust.' },
              { icon: 'monitoring', title: 'Real-time Analytics', desc: 'Track market trends, deal progress, and performance metrics in one dashboard.' },
              { icon: 'smart_toy', title: 'AI Assistant', desc: 'Get intelligent recommendations and automated workflow suggestions.' },
              { icon: 'bolt', title: 'Fast Execution', desc: 'Streamlined processes to close deals faster than traditional methods.' },
              { icon: 'language', title: 'Global Reach', desc: 'Connect with suppliers in 150+ countries with multi-language support.' },
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="feature-card p-6 bg-white rounded-2xl border border-outline-variant h-full">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4 group-hover:scale-110">
                    <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                  </div>
                  <h3 className="font-headline font-bold text-on-surface mb-2">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ENTERPRISE TIERS ══ */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-4">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Membership Plans</p>
            <h2 className="text-3xl md:text-4xl font-headline font-black text-on-surface dark:text-white mb-2 transition-colors">
              Your Karm Baba Growth Ladder
            </h2>
            <p className="text-on-surface-variant dark:text-slate-400 text-sm transition-colors">Start free. Grow at your pace. Every plan builds on the last.</p>
          </FadeIn>

          {/* Currency toggle */}
          <FadeIn className="flex justify-center mb-10">
            <div className="flex items-center gap-1 p-1 rounded-xl border border-outline-variant dark:border-slate-700 bg-slate-50 dark:bg-slate-900 transition-colors">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-5 py-2 rounded-lg text-sm font-headline font-bold transition-all ${currency === 'INR' ? 'bg-primary text-white shadow-md shadow-orange-200 dark:shadow-none' : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                🇮🇳 INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-5 py-2 rounded-lg text-sm font-headline font-bold transition-all ${currency === 'USD' ? 'bg-primary text-white shadow-md shadow-orange-200 dark:shadow-none' : 'text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                🌍 USD
              </button>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* FREE */}
            <FadeIn delay={0}>
              <div className="tier-card p-7 bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant dark:border-slate-700 h-full flex flex-col transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Free Forever</p>
                <div className="text-4xl font-headline font-black text-on-surface dark:text-white mb-1 transition-colors">₹0 <span className="text-base font-normal text-on-surface-variant dark:text-slate-400">/ $0</span></div>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-4 transition-colors">3 Products · No card needed · No expiry</p>
                <div className="w-8 h-1 rounded-full bg-orange-200 dark:bg-orange-900/50 mb-5 transition-colors" />
                <ul className="space-y-2.5 text-sm text-on-surface-variant dark:text-slate-300 mb-8 flex-1 transition-colors">
                  {['List 3 Products — Free Forever', 'Verified Business Profile', 'Receive Real Buyer Inquiries', 'WhatsApp & Email Trade Alerts', 'Taste of Karm AI', 'CRM Access at ₹99 / $1.11'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border-2 border-primary text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
                  Start Free →
                </button>
              </div>
            </FadeIn>

            {/* TRIAL */}
            <FadeIn delay={80}>
              <div className="tier-card p-7 bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant dark:border-slate-700 h-full flex flex-col transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Trial Plan</p>
                <div className="text-4xl font-headline font-black text-on-surface dark:text-white mb-1 transition-colors">
                  {currency === 'INR' ? '₹999' : '$12'} <span className="text-base font-normal text-on-surface-variant dark:text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹9,990 — Save ₹1,998' : 'Yearly $119 — Save $25'}</p>
                <div className="w-8 h-1 rounded-full bg-orange-200 dark:bg-orange-900/50 mb-5 transition-colors" />
                <ul className="space-y-2.5 text-sm text-on-surface-variant dark:text-slate-300 mb-8 flex-1 transition-colors">
                  {['Unlimited Product Listings', 'Premium CRM Access', 'Priority Business Listing', 'Real-Time Trade Alerts', 'Monthly Trade Insights Report', 'Cancel Anytime — No Questions'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border-2 border-primary text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
                  Try Full Platform →
                </button>
              </div>
            </FadeIn>

            {/* BASIC CONNECT */}
            <FadeIn delay={160}>
              <div className="tier-card p-7 bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant dark:border-slate-700 h-full flex flex-col transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Basic Connect</p>
                <div className="text-4xl font-headline font-black text-on-surface dark:text-white mb-1 transition-colors">
                  {currency === 'INR' ? '₹3,999' : '$49'} <span className="text-base font-normal text-on-surface-variant dark:text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹39,999 — Save ₹7,989' : 'Yearly $444 — Save $144'}</p>
                <div className="w-8 h-1 rounded-full bg-orange-200 dark:bg-orange-900/50 mb-5 transition-colors" />
                <ul className="space-y-2.5 text-sm text-on-surface-variant dark:text-slate-300 mb-8 flex-1 transition-colors">
                  {['Verified Business Listing', 'Premium CRM — Full Access', 'Karm AI Access', 'WhatsApp & Email Trade Alerts', 'Monthly Trade Insights Report', 'Dedicated Digital Trade Support'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border-2 border-primary text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
                  Start Growing →
                </button>
              </div>
            </FadeIn>

            {/* SMART GROWTH — MOST POPULAR */}
            <FadeIn delay={0}>
              <div className="tier-card relative p-7 rounded-2xl h-full flex flex-col"
                style={{ background: '#f97316', boxShadow: '0 24px 50px rgba(249,115,22,.38)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                  <span className="material-symbols-outlined text-accent" style={{ fontSize: '12px' }}>star</span> Most Popular
                </div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Smart Growth</p>
                <div className="text-4xl font-headline font-black text-white mb-1">
                  {currency === 'INR' ? '₹9,999' : '$119'} <span className="text-base font-normal text-white/70">/mo</span>
                </div>
                <p className="text-xs text-white/80 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹94,999 — Save ₹24,989' : 'Yearly $1,111 — Save $317'}</p>
                <div className="w-8 h-1 rounded-full bg-white/30 mb-5" />
                <ul className="space-y-2.5 text-sm text-white/90 mb-8 flex-1">
                  {['150 Verified Leads Every Month', 'Priority Search Placement', 'Premium CRM — Convert Leads', 'SEO-Optimised Trade Listing', 'Buyer & Shipment History Access', '1:1 Trade Strategy Onboarding Call'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 bg-white text-primary font-headline font-bold rounded-xl hover:bg-orange-50 transition-all hover:shadow-lg active:scale-95 text-sm">
                  Start Execution →
                </button>
              </div>
            </FadeIn>

            {/* PRO TRADE BOOST — BEST VALUE */}
            <FadeIn delay={80}>
              <div className="tier-card relative p-7 bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary h-full flex flex-col transition-colors"
                style={{ boxShadow: '0 8px 24px rgba(249,115,22,.15)' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                  Best Value — 60%+ Off
                </div>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pro Trade Boost</p>
                <div className="text-4xl font-headline font-black text-on-surface dark:text-white mb-1 transition-colors">
                  {currency === 'INR' ? '₹19,999' : '$250'} <span className="text-base font-normal text-on-surface-variant dark:text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹79,999 — Save ₹1,59,989 (60%+ off)' : 'Yearly $999 — Save $2,001 (60%+ off)'}</p>
                <div className="w-8 h-1 rounded-full bg-orange-200 dark:bg-orange-900/50 mb-5 transition-colors" />
                <ul className="space-y-2.5 text-sm text-on-surface-variant dark:text-slate-300 mb-8 flex-1 transition-colors">
                  {['250 Deeply Verified Leads Monthly', '300+ Direct Buyer Phone Numbers', 'Monthly Bulk Shipment Records', 'Competitor Intelligence Access', 'Direct Access to Trade Executives', 'Your Own 1-on-1 Relationship Manager', 'Karm AI Trade Intelligence'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 bg-primary text-white font-headline font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-orange-200 dark:shadow-none text-sm">
                  Go Pro →
                </button>
              </div>
            </FadeIn>

            {/* BUSINESS BOOST */}
            <FadeIn delay={160}>
              <div className="tier-card p-7 bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant dark:border-slate-700 h-full flex flex-col transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Business Boost</p>
                <div className="text-4xl font-headline font-black text-on-surface dark:text-white mb-1 transition-colors">
                  {currency === 'INR' ? '₹35,999' : '$444'} <span className="text-base font-normal text-on-surface-variant dark:text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹2,97,500 — Save ₹1,34,488' : 'Yearly $4,444 — Save $888'}</p>
                <div className="w-8 h-1 rounded-full bg-orange-200 dark:bg-orange-900/50 mb-5 transition-colors" />
                <ul className="space-y-2.5 text-sm text-on-surface-variant dark:text-slate-300 mb-8 flex-1 transition-colors">
                  {['330 Precision-Matched Leads Monthly', 'Dedicated Senior Account Manager', 'Premium Profile + Product Video', 'Human-Intelligence Buyer Matching', '300+ Direct Executive Contacts', 'Sample Coordination & Buyer Follow-Up', 'Quarterly Targeted Marketing Campaign', 'Custom Integrations & API Access'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border-2 border-primary text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
                  Boost Business →
                </button>
              </div>
            </FadeIn>

            {/* ENTERPRISE — full width */}
            <FadeIn delay={0} className="md:col-span-3">
              <div className="tier-card p-8 rounded-2xl flex flex-col md:flex-row md:items-center gap-8"
                style={{ background: '#0f172a' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Full Power</span>
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Enterprise Plan</span>
                  </div>
                  <div className="text-4xl font-headline font-black text-white mb-1">
                    {currency === 'INR' ? '₹60,000' : '$777'} <span className="text-base font-normal text-white/50">/mo</span>
                  </div>
                  <p className="text-xs text-green-400 font-bold mb-4">{currency === 'INR' ? 'Yearly ₹4,80,000 — Save ₹2,40,000' : 'Yearly $7,777 — Save $1,547'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      '500 High-Intent Verified Leads Monthly',
                      'Unlimited 4B+ Global Shipment Records',
                      '4 Million+ Verified Business Contacts',
                      'Advanced Weekly Analytics & Custom Reports',
                      'On-Demand International Trade Consulting',
                      'Exclusive In-Person Buyer Matchmaking Events',
                      'Custom Integrations, API & White-Label Options',
                      'Priority 1-on-1 Relationship Manager',
                      'Dedicated Customer Success Manager',
                      'Karm AI — Full Intelligence Suite',
                    ].map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="w-4 h-4 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '10px' }}>check</span>
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 md:min-w-[200px] text-center">
                  <button className="w-full py-3 bg-primary text-white font-headline font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-orange-900/40 text-sm shimmer-btn">
                    Contact Sales →
                  </button>
                  <button className="w-full py-3 border-2 border-white/15 text-white/60 font-headline font-bold rounded-xl hover:border-primary hover:text-primary transition-all text-sm">
                    View Full Details
                  </button>
                  <p className="text-white/25 text-xs">Custom plans available</p>
                  <p className="text-white/25 text-xs">hello@karmbaba.com</p>
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Promise strip */}
          <FadeIn delay={200} className="mt-8 text-center">
            <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed max-w-2xl mx-auto italic transition-colors">
              "We do not sell you a subscription. We invest in your growth." — <span className="text-primary font-bold not-italic">The Karm Baba Promise</span>
            </p>
            <p className="text-on-surface-variant/60 dark:text-slate-500 text-xs mt-2 transition-colors">USD pricing at ₹84 = $1 · All prices exclusive of applicable taxes · Free plan never expires</p>
          </FadeIn>
        </div>
      </section>


      {/* ══ TESTIMONIALS ══ */}
      <section className="py-20 px-6 md:px-12 overflow-hidden" style={{ background: '#0f172a' }}>
        <style>{`
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .testi-track { display: flex; gap: 1.25rem; animation: ticker 48s linear infinite; width: max-content; }
    .testi-track-reverse { display: flex; gap: 1.25rem; animation: ticker 52s linear infinite reverse; width: max-content; }
    .testi-track:hover, .testi-track-reverse:hover { animation-play-state: paused; }
    .testi-track-wrap { position: relative; overflow: hidden; }
    .testi-track-wrap::before, .testi-track-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 8rem; z-index: 10; pointer-events: none; }
    .testi-track-wrap::before { left: 0; background: linear-gradient(90deg, #0f172a, transparent); }
    .testi-track-wrap::after { right: 0; background: linear-gradient(-90deg, #0f172a, transparent); }
  `}</style>

        {/* Header */}
        <FadeIn className="max-w-5xl mx-auto mb-12">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Trusted by 500+ Businesses</p>
          <h2 className="text-3xl md:text-4xl font-headline font-black text-white mb-3">
            Real Businesses. Real Growth.<br />Real Results.
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-xl">
            From Iraq to Africa, from ornaments to drones — KARM BABA powers global trade for every industry.
          </p>
        </FadeIn>

        {/* Row 1 — scrolls left */}
        <div className="testi-track-wrap mb-5">
          <div className="testi-track">
            {[...row1, ...row1].map((t, i) => (
              <TestiCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="testi-track-wrap">
          <div className="testi-track-reverse">
            {[...row2, ...row2].map((t, i) => (
              <TestiCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <FadeIn className="max-w-5xl mx-auto mt-10">
          <div className="flex items-center justify-between gap-4 flex-wrap px-6 py-5 rounded-2xl border border-orange-500/20"
            style={{ background: 'rgba(249,115,22,0.08)' }}>
            <div>
              <p className="font-headline font-bold text-white text-base">
                Join <span className="text-primary">500+ Businesses</span> Already Growing with Karm Baba
              </p>
              <p className="text-white/40 text-sm mt-1">From India to international markets — Karm Baba powers real trade, everywhere.</p>
            </div>
            <div className="flex gap-5 flex-wrap">
              {[
                { icon: 'mail', label: 'karm@karmbaba.com', href: 'mailto:karm@karmbaba.com', ariaLabel: 'Email Karm Baba' },
                { icon: 'call', label: '+91 9034975500', href: 'tel:+919034975500', ariaLabel: 'Call Karm Baba' },
                { icon: 'language', label: 'karmbaba.com', href: 'https://karmbaba.com', ariaLabel: 'Visit Karm Baba Website', target: '_blank', rel: 'noopener noreferrer' },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  aria-label={c.ariaLabel}
                  target={c.target}
                  rel={c.rel}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1rem' }} aria-hidden="true">{c.icon}</span>
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden" style={{ background: '#111827' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(249,115,22,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(251,146,60,.1) 0%, transparent 60%)' }} />
        <FadeIn className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-headline font-black text-white mb-4">
            Start closing deals today.
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed">
            Join the elite network of global businesses executing high-value trade with absolute certainty.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="shimmer-btn px-8 py-3.5 text-white font-headline font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-orange-900/30">
              Create Your Account →
            </Link>
            <Link href="/deals"
              className="px-8 py-3.5 border-2 border-white/20 text-white font-headline font-bold rounded-xl hover:border-primary hover:text-primary transition-all">
              View Active Deals
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="px-6 md:px-12 py-12 border-t border-white/5" style={{ background: '#0f172a' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-headline font-black text-primary text-lg mb-2">KARM BABA</p>
            <p className="text-white/40 text-xs leading-relaxed">The global trade intelligence platform for elite deal execution.</p>
          </div>
          {[
            { title: 'Marketplace', links: ['Agriculture', 'Automotive', 'Textile'] },
            { title: 'Support', links: ['Import-Export', 'Privacy', 'Terms'] },
            { title: 'Global', links: ['50+ Countries', 'API Access', 'Enterprise'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-white/40 text-sm hover:text-primary transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-white/25 text-xs">
          &copy; 2024 KARM BABA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}