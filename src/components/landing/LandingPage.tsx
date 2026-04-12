'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
declare global {
  interface Window { Razorpay: any; }
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

interface SiteStats { backtests: number; users: number; uptime: number; }

/* ─────────────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

/* ─────────────────────────────────────────────────────────
   Animated Chart Bars (hero card)
───────────────────────────────────────────────────────── */
function AnimatedChart() {
  const [bars, setBars] = useState([20,35,45,30,55,85,70,75,40,25,95]);
  useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => [...prev.slice(1), Math.floor(30 + Math.random() * 65)]);
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-end gap-1 h-[80px]">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-700 ease-in-out"
          style={{ height: `${h}%`, background: i === bars.length - 1 ? '#D4A843' : `rgba(0,54,26,${0.15 + (h/100)*0.85})` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Live Ticker
───────────────────────────────────────────────────────── */
const STATIC_TICKERS = [
  { sym:'NIFTY 50', val:'22,419', chg:'+0.82%', up:true },
  { sym:'SENSEX',   val:'73,876', chg:'+0.65%', up:true },
  { sym:'BANK NIFTY', val:'47,286', chg:'-0.12%', up:false },
  { sym:'RELIANCE', val:'₹2,942', chg:'+1.24%', up:true },
  { sym:'HDFC BANK', val:'₹1,612', chg:'+0.44%', up:true },
  { sym:'INFOSYS',  val:'₹1,488', chg:'-0.31%', up:false },
  { sym:'TCS',      val:'₹3,754', chg:'+0.89%', up:true },
  { sym:'ICICI',    val:'₹1,187', chg:'+0.67%', up:true },
];

function TickerBar() {
  const [tickers, setTickers] = useState(STATIC_TICKERS);
  // Try to load live indices
  useEffect(() => {
    fetch('/api/market/indices')
      .then(r => r.json())
      .then(d => {
        if (d.indices?.length) {
          const live = d.indices.map((idx: any) => ({
            sym: idx.name,
            val: idx.value.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
            chg: `${idx.changeP >= 0 ? '+' : ''}${idx.changeP.toFixed(2)}%`,
            up: idx.changeP >= 0,
          }));
          setTickers([...live, ...STATIC_TICKERS.slice(live.length)]);
        }
      }).catch(() => {});
  }, []);

  return (
    <div className="bg-[#0F1A14] text-white overflow-hidden py-2 border-b border-white/10 relative z-40 h-8">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 font-data text-[11px]">
            <span className="text-stone-400 uppercase tracking-widest text-[10px]">{t.sym}</span>
            <span className="font-bold">{t.val}</span>
            <span className={t.up ? 'text-emerald-400' : 'text-red-400'}>{t.chg}</span>
            <span className="text-white/20 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Razorpay Checkout
───────────────────────────────────────────────────────── */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('rzp-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'rzp-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function handleCheckout(planId: string, onDone: (ok: boolean, msg: string) => void) {
  const loaded = await loadRazorpayScript();
  if (!loaded) { onDone(false, 'Payment gateway failed to load'); return; }

  try {
    const orderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle: 'monthly' }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error ?? 'Order creation failed');

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'AlgoVeda',
      description: `${order.planName} — Monthly`,
      order_id: order.orderId,
      prefill: { email: order.userEmail ?? '' },
      theme: { color: '#1A4D2E' },
      handler: async (response: any) => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          }),
        });
        const v = await verifyRes.json();
        if (v.success) onDone(true, 'Subscription activated! Welcome to ' + order.planName);
        else onDone(false, 'Payment failed verification');
      },
      modal: { ondismiss: () => onDone(false, '') },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (e: any) {
    onDone(false, e.message ?? 'Payment error');
  }
}

/* ─────────────────────────────────────────────────────────
   Feature Card
───────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }: { icon:string; title:string; desc:string; delay:number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="glass-panel p-10 hover:shadow-2xl hover:shadow-primary/10 hover:translate-y-[-4px] transition-all duration-300 group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      <div className="w-12 h-12 bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">{icon}</span>
      </div>
      <h3 className="font-ui text-xl font-bold mb-4 text-primary">{title}</h3>
      <p className="font-body text-on-surface-variant leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pricing Card (with Razorpay)
───────────────────────────────────────────────────────── */
function PricingCard({ plan, onToast }: { plan: Plan; onToast: (ok: boolean, msg: string) => void }) {
  const { ref, inView } = useInView(0.1);
  const popular = plan.slug === 'pro';
  const isFree  = plan.price_monthly === 0;
  const [paying, setPaying] = useState(false);

  const handleClick = async () => {
    if (isFree) { window.location.href = '/auth/signup'; return; }
    setPaying(true);
    await handleCheckout(plan.id, (ok, msg) => {
      if (msg) onToast(ok, msg);
      setPaying(false);
    });
  };

  return (
    <div
      ref={ref}
      className={`bg-white border relative overflow-hidden transition-all duration-500 hover:translate-y-[-4px] group
        ${popular ? 'border-[#1a4d2e] shadow-2xl z-10 scale-[1.03]' : 'border-stone-200 shadow-card hover:shadow-elevated'}
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ borderWidth: popular ? 2 : 1 }}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-secondary px-3 py-1 text-[8px] font-bold text-white uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <div className="p-8">
        <div className="font-ui text-[10px] uppercase tracking-widest mb-2 text-stone-400">{plan.name}</div>
        <div className="font-headline text-3xl text-primary mb-1">
          {isFree ? 'Free' : `₹${(plan.price_monthly / 100).toLocaleString('en-IN')}`}
        </div>
        {!isFree && <div className="font-ui text-[10px] text-stone-400 mb-6">per month</div>}
        {isFree && <div className="mb-6 h-4" />}

        <ul className="space-y-3 mb-8">
          {(plan.features ?? []).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
              <span
                className={`material-symbols-outlined text-[16px] ${popular ? 'text-secondary' : 'text-emerald-600'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {popular ? 'verified' : 'check'}
              </span>
              <span className={popular ? 'font-bold text-on-surface' : ''}>{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleClick}
          disabled={paying}
          className={`w-full py-4 font-ui text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2
            ${popular
              ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
              : 'border border-primary text-primary hover:bg-primary hover:text-white'
            } disabled:opacity-60`}
        >
          {paying ? (
            <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Processing...</>
          ) : (
            isFree ? 'Get Started Free' : `Select ${plan.name}`
          )}
        </button>
      </div>
      {popular && <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-secondary/5 rounded-full blur-2xl" />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AI Picks strip
───────────────────────────────────────────────────────── */
const AI_PICKS = [
  { sym:'HDFCBANK', co:'HDFC Bank Ltd.', tag:'BULLISH', sector:'Banking', cap:'Large Cap',
    note:'Mean reversion detected on daily TF with strong accumulation at 200 EMA support.' },
  { sym:'TATASTEEL', co:'Tata Steel Ltd.', tag:'BULLISH', sector:'Commodities', cap:'Cyclical',
    note:'Volume breakout confirmed. RSI indicates untapped momentum potential.' },
  { sym:'RELIANCE', co:'Reliance Industries', tag:'NEUTRAL', sector:'Energy', cap:'Bluechip',
    note:'High volatility expected due to upcoming earnings. Watching consolidation phase.' },
];

function MarketIntelSection() {
  const { ref, inView } = useInView(0.1);
  return (
    <section className="py-20 px-8 bg-surface-container-high" ref={ref}>
      <div className="container mx-auto max-w-[1320px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateX(-24px)', transition: 'all 0.7s ease' }}>
          <span className="font-ui text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">AI Intelligence</span>
          <h2 className="font-headline text-4xl text-primary mb-6">Today's <span className="italic">AI Picks</span></h2>
          <p className="font-body text-on-surface-variant leading-relaxed mb-8 max-w-md">
            Our model scans thousands of instruments daily, surfacing the highest-conviction opportunities backed by data — not noise.
          </p>
          <Link href="/auth/signup" className="inline-block bg-primary text-white font-ui font-bold px-8 py-4 hover:bg-[#1A4D2E] hover:translate-y-[-2px] transition-all shadow-lg shadow-primary/15">
            View Full AI Thesis →
          </Link>
        </div>
        <div className="space-y-4" style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateX(24px)', transition: 'all 0.7s ease 0.2s' }}>
          {AI_PICKS.map((p, i) => (
            <div key={i} className="glass-panel p-5 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-ui font-bold text-sm tracking-tight">{p.sym}</h4>
                  <p className="text-[10px] font-data text-stone-500">{p.co}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${p.tag === 'BULLISH' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  {p.tag}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <span className="text-[9px] bg-stone-100 px-2 py-0.5 text-stone-600 font-ui uppercase tracking-tighter">{p.sector}</span>
                <span className="text-[9px] bg-stone-100 px-2 py-0.5 text-stone-600 font-ui uppercase tracking-tighter">{p.cap}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed italic border-l-2 border-secondary/30 pl-3">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [email, setEmail]       = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn]     = useState(false);
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [stats, setStats]       = useState<SiteStats | null>(null);
  const [toast, setToast]       = useState<{ ok: boolean; msg: string } | null>(null);

  const statsRef  = useInView(0.2);
  const backtestC = useCountUp(stats?.backtests ?? 0, 2000, statsRef.inView && (stats?.backtests ?? 0) > 0);
  const userC     = useCountUp(stats?.users ?? 0, 1800, statsRef.inView && (stats?.users ?? 0) > 0);

  const showToast = useCallback((ok: boolean, msg: string) => {
    if (!msg) return;
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Scroll nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Hero entrance
  useEffect(() => { const t = setTimeout(() => setHeroIn(true), 80); return () => clearTimeout(t); }, []);

  // Load plans from DB
  useEffect(() => {
    fetch('/api/admin/plans')
      .then(r => r.json())
      .then(d => {
        const active = (d.plans ?? []).filter((p: Plan) => p.is_active).sort((a: Plan, b: Plan) => a.sort_order - b.sort_order);
        if (active.length) setPlans(active);
      }).catch(() => {});
  }, []);

  // Load real stats
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(true, "You're on the list! Expect curated alpha in your inbox.");
    setEmail('');
  };

  // Fallback pricing if DB unavailable
  const FALLBACK_PLANS: Plan[] = [
    { id:'p1', name:'Explorer',    slug:'explorer',    price_monthly:0,      price_yearly:null,    features:['5 Backtests/day','Basic Screener','Delayed Data','Daily Digest'], is_active:true, sort_order:1 },
    { id:'p2', name:'Researcher',  slug:'researcher',  price_monthly:49900,  price_yearly:499000,  features:['20 Backtests/month','Full Screener','AI Rationale','4hr Digest'], is_active:true, sort_order:2 },
    { id:'p3', name:'Pro Analyst', slug:'pro',         price_monthly:149900, price_yearly:1499000, features:['Unlimited Backtests','Portfolio Analytics','1hr Digest','Priority Support','API Access'], is_active:true, sort_order:3 },
    { id:'p4', name:'Institution', slug:'institution', price_monthly:499900, price_yearly:null,    features:['White-labeling','Dedicated Server','24/7 Concierge','SLA Guarantee'], is_active:true, sort_order:4 },
  ];
  const displayPlans = plans.length ? plans : FALLBACK_PLANS;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-fixed overflow-x-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-lg shadow-2xl font-ui text-sm text-white flex items-center gap-2 transition-all animate-[fadeIn_0.3s_ease] ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.ok ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Live Ticker */}
      <TickerBar />

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className={`fixed top-8 w-full h-16 flex justify-between items-center px-8 z-50 transition-all duration-300 ${scrolled ? 'glass-panel shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <span className="text-2xl font-headline italic font-bold text-primary">AlgoVeda</span>
          <div className="hidden md:flex items-center gap-8 ml-10">
            <a href="#features" className="font-ui text-sm font-bold text-secondary hover:text-primary transition-colors">Markets</a>
            <a href="#features" className="font-ui text-sm text-stone-600 hover:text-primary transition-colors">Features</a>
            <a href="#pricing"  className="font-ui text-sm text-stone-600 hover:text-primary transition-colors">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden md:block font-ui text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200">
            Upgrade to PRO
          </button>
          <Link href="/auth/login"  className="font-ui text-sm text-stone-600 hover:text-primary transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-primary text-white font-ui font-bold px-5 py-2.5 text-sm hover:bg-[#1A4D2E] hover:translate-y-[-1px] transition-all shadow-lg shadow-primary/20">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <header className="relative min-h-screen mesh-gradient flex items-center pt-24 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-10 right-[5%] w-[520px] h-[520px] rounded-full opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsla(145,40%,80%,0.9) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-[8%] w-[300px] h-[300px] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsla(42,70%,80%,0.9) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-8 max-w-[1320px] grid grid-cols-12 gap-8 items-center">

          {/* Left Panel */}
          <div className="col-span-12 lg:col-span-7 z-10"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateY(32px)', transition: 'all 0.7s ease 0.1s' }}>
            <div className="glass-panel p-10 lg:p-16 shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 mb-8">
                <div className="live-dot w-2 h-2 rounded-full bg-emerald-500" />
                <p className="font-data text-xs uppercase tracking-[0.3em] text-secondary">Institutional Grade Intelligence</p>
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl text-primary leading-[1.05] mb-8">
                Research smarter.<br />
                <span className="italic">Trade with proof.</span>
              </h1>
              <p className="font-body text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                The sovereign platform for modern quant analysis. Leverage institutional-grade backtesting, real-time screeners, and AI-driven insights to manage your capital with total conviction.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/auth/signup"
                  className="bg-primary text-white font-ui font-bold px-10 py-5 shadow-lg shadow-primary/15 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 transition-all duration-200">
                  Get Started Free
                </Link>
                <button className="border-2 border-primary/20 text-primary font-ui font-bold px-10 py-5 hover:bg-primary/5 transition-colors">
                  Watch demo →
                </button>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
                {['No SEBI advisory — pure research', 'Free tier, no credit card'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — animated chart card */}
          <div className="hidden lg:block lg:col-span-5 relative h-[480px]"
            style={{ opacity: heroIn ? 1 : 0, transform: heroIn ? 'none' : 'translateX(32px)', transition: 'all 0.7s ease 0.35s' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-panel w-[420px] animate-float shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-white/30 pb-4">
                  <div>
                    <h3 className="font-data text-xs text-secondary uppercase tracking-wider">RELIANCE / NSE</h3>
                    <div className="font-headline text-2xl text-primary mt-1">₹2,942.45</div>
                  </div>
                  <div className="text-right">
                    <div className="font-data text-sm text-emerald-600 font-bold">+1.24%</div>
                    <div className="font-ui text-[10px] uppercase text-stone-400 mt-1">Backtest Score: 84/100</div>
                  </div>
                </div>
                <AnimatedChart />
                <div className="grid grid-cols-2 gap-3">
                  {[{ l: 'Max Drawdown', v: '-4.2%' }, { l: 'Win Rate', v: '68.5%' }].map(m => (
                    <div key={m.l} className="bg-white/40 p-3">
                      <span className="font-data text-[9px] text-stone-500 uppercase">{m.l}</span>
                      <div className="font-data text-sm font-bold mt-0.5">{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-data text-[10px] text-stone-400 uppercase tracking-wider">Live Feed Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── STATS BAR (real data, hidden if all zeros) ── */}
      <div ref={statsRef.ref}>
        {stats && (stats.backtests > 0 || stats.users > 0) && (
          <section className="bg-surface-container-high py-12 border-t border-b border-surface-dim">
            <div className="container mx-auto px-8 max-w-[1320px] flex flex-wrap justify-between items-center gap-8">
              <div className="flex items-center gap-12 flex-wrap">
                {stats.backtests > 0 && (
                  <>
                    <div>
                      <div className="font-data text-2xl text-primary font-bold">
                        {backtestC >= 1000 ? `${(backtestC / 1000).toFixed(1)}k+` : `${backtestC}+`}
                      </div>
                      <div className="font-ui text-[10px] uppercase tracking-wider text-stone-500 mt-1">Backtests Run</div>
                    </div>
                    <div className="w-px h-8 bg-stone-300 hidden md:block" />
                  </>
                )}
                {stats.users > 0 && (
                  <>
                    <div>
                      <div className="font-data text-2xl text-primary font-bold">
                        {userC >= 1000 ? `${(userC / 1000).toFixed(1)}k` : `${userC}`}
                      </div>
                      <div className="font-ui text-[10px] uppercase tracking-wider text-stone-500 mt-1">Active Quants</div>
                    </div>
                    <div className="w-px h-8 bg-stone-300 hidden md:block" />
                  </>
                )}
                <div>
                  <div className="font-data text-2xl text-primary font-bold">99.9%</div>
                  <div className="font-ui text-[10px] uppercase tracking-wider text-stone-500 mt-1">Uptime Precision</div>
                </div>
              </div>
              <div className="flex items-center gap-8 opacity-40 grayscale">
                {['NSE', 'BSE', 'SEBI'].map(b => (
                  <span key={b} className="font-data text-sm font-bold tracking-widest text-stone-600">{b}</span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── FEATURES BENTO ───────────────────────────── */}
      <section id="features" className="py-24 px-8">
        <div className="container mx-auto max-w-[1320px]">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="font-ui text-xs font-bold text-secondary mb-4 tracking-widest uppercase">The Engine Room</span>
            <h2 className="font-headline text-4xl lg:text-5xl text-primary mb-6">
              Designed for those who <br />
              <span className="italic">demand mechanical excellence.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon:'history_toggle_off', title:'Ultra-Fast Backtesting',    desc:'Execute complex vectorised strategies over 10 years of NSE/BSE tick-data in seconds. Parallel processing for massive speed gains.' },
              { icon:'filter_alt',         title:'Market Screener',           desc:'Sift through 5,000+ instruments using custom fundamental and technical filters. Real-time scanning, zero latency.' },
              { icon:'auto_awesome',       title:'AI Research Engine',        desc:'Groq-powered LLM generates institutional-grade reports for any Indian stock in under 5 seconds.' },
              { icon:'currency_exchange',  title:'Paper Trading',             desc:'Risk-free strategy validation with live market prices. Simulates real brokerage costs and slippage accurately.' },
              { icon:'mail',               title:'Smart Email Digests',       desc:'Automated market updates every 3 hours — Nifty movers, watchlist, AI commentary delivered to your inbox.' },
              { icon:'notifications_active', title:'Real-Time Alerts',        desc:'Price alerts, RSI signals, MA crossovers — get notified instantly the moment your conditions are met.' },
            ].map((f, i) => <FeatureCard key={i} {...f} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* AI Picks Section */}
      <MarketIntelSection />

      {/* ── PRICING ──────────────────────────────────── */}
      <section id="pricing" className="py-24 px-8 bg-surface-container-low">
        <div className="container mx-auto max-w-[1320px]">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl text-primary">Institutional Access</h2>
            <p className="font-body text-on-surface-variant mt-4 text-lg">Flexible plans for retail legends and sovereign entities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {displayPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onToast={showToast} />
            ))}
          </div>
          <p className="text-center text-[10px] text-stone-400 font-data mt-8 uppercase tracking-widest">
            Payments secured by Razorpay · 256-bit SSL · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="bg-[#0F1A14] text-white pt-20 pb-10 px-8">
        <div className="container mx-auto max-w-[1320px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div>
              <h4 className="font-headline italic text-2xl mb-6">AlgoVeda</h4>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Precision engineering for the modern investor. Built in Bangalore for the world's most demanding quants.
              </p>
              <div className="flex gap-4">
                {['share','public','mail'].map(icon => (
                  <a key={icon} href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-secondary mb-8">Platform</h5>
              <ul className="space-y-4 text-stone-400 text-sm">
                {['Screener','Backtester','Paper Trading','AI Research'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-secondary mb-8">Company</h5>
              <ul className="space-y-4 text-stone-400 text-sm">
                {['About','Institutional','Careers','Security'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-secondary mb-8">Newsletter</h5>
              <p className="text-stone-500 text-xs mb-6">Receive curated alpha and market insights directly.</p>
              <form onSubmit={handleNewsletter} className="flex">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="bg-white/5 border border-white/10 text-sm flex-grow px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary text-white placeholder:text-stone-600"
                />
                <button type="submit" className="bg-secondary text-on-secondary px-4 py-2 font-ui text-xs font-bold hover:opacity-90 transition-opacity">Join</button>
              </form>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-stone-600 uppercase tracking-widest">
            <div>© 2026 AlgoVeda Institutional Technologies. All Rights Reserved. Not SEBI advisory.</div>
            <div className="flex gap-8">
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <a key={l} href="#" className="hover:text-stone-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}