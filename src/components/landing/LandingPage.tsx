'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup - would connect to database
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1b1c1a]">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full h-16 flex justify-between items-center px-8 z-50 glass-panel">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A4D2E] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <span className="text-2xl font-headline italic font-bold text-[#00361a]">AlgoVeda</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="font-ui text-sm text-stone-600 hover:text-[#00361a]">Features</Link>
            <Link href="#pricing" className="font-ui text-sm text-stone-600 hover:text-[#00361a]">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="font-ui text-sm text-stone-600 hover:text-[#00361a]">Sign In</Link>
          <Link href="/auth/signup" className="bg-[#00361a] text-white font-ui font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#1A4D2E]">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen mesh-gradient flex items-center pt-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[80%] pointer-events-none">
          <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, hsla(145,40%,80%,0.8) 0%, transparent 70%)' }}></div>
        </div>

        <div className="container mx-auto px-8 max-w-[1320px] grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-7 z-10">
            <div className="glass-panel p-10 lg:p-14 shadow-2xl shadow-[#1A4D2E]/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4A843]"></div>
                <span className="font-data text-xs uppercase tracking-[0.3em] text-[#795900]">
                  Market Intelligence Platform
                </span>
              </div>

              <h1 className="font-headline text-5xl lg:text-[4.5rem] text-[#0F1A14] leading-[1.05] mb-8">
                Research smarter.<br />
                <span className="italic">Trade with proof.</span>
              </h1>

              <p className="font-body text-lg text-[#4A5568] max-w-xl mb-10 leading-relaxed">
                Backtest any strategy on Indian markets, screen stocks with AI rationale, and get personalized market digests every 3 hours.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/auth/signup" className="bg-[#1A4D2E] text-white font-ui font-bold px-8 py-4 rounded-lg text-sm tracking-wide hover:bg-[#143D24] shadow-lg">
                  Start Free Research
                </Link>
                <button className="border-2 border-[#1A4D2E]/20 text-[#1A4D2E] font-ui font-bold px-8 py-4 rounded-lg text-sm hover:bg-[#1A4D2E]/5">
                  Watch demo →
                </button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm font-body text-[#4A5568]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#16A34A] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>No SEBI advisory — pure research</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#16A34A] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span>Free tier, no credit card</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="hidden lg:block lg:col-span-5 relative h-[480px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-panel w-[420px] rounded-2xl rotate-[-3deg] translate-x-8 shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-white/30 pb-4">
                  <div>
                    <h3 className="font-data text-xs text-[#795900] uppercase">RELIANCE / NSE</h3>
                    <div className="font-headline text-2xl text-[#00361a] mt-1">Live Data</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-data text-emerald-600">Real-time</span>
                  </div>
                </div>
                <div className="flex items-center justify-center h-20">
                  <Link href="/auth/signup" className="text-[#1A4D2E] font-ui font-bold text-sm hover:underline">
                    Sign up to view live data →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="bg-[#e9e8e4] py-10 border-t border-b border-[#E8E6DF]">
        <div className="container mx-auto px-8 max-w-[1320px]">
          <div className="flex flex-wrap justify-between items-center gap-8">
            {[
              { num: 'Live', label: 'Real NSE Data' },
              { num: 'AI', label: 'Powered Analysis' },
              { num: '24/7', label: 'Market Monitoring' },
              { num: '0', label: 'Credit Card Required' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-8">
                {i > 0 && <div className="hidden md:block w-px h-8 bg-stone-300"></div>}
                <div>
                  <div className="font-data text-2xl text-[#00361a] font-bold">{stat.num}</div>
                  <div className="font-ui text-[10px] uppercase tracking-wider text-stone-500 mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8">
        <div className="container mx-auto max-w-[1320px]">
          <div className="text-center mb-16">
            <span className="font-ui text-xs font-bold text-[#795900] tracking-widest uppercase">The Engine Room</span>
            <h2 className="font-headline text-4xl lg:text-5xl text-[#00361a] mt-4 mb-4">
              Designed for those who<br />
              <span className="italic">demand mechanical excellence.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'history_toggle_off', title: 'Ultra-Fast Backtesting', desc: 'Execute complex strategies over 10 years of historical NSE/BSE data in seconds.' },
              { icon: 'filter_alt', title: 'Intelligent Stock Screener', desc: 'Filter 5000+ NSE instruments using custom fundamental and technical parameters.' },
              { icon: 'menu_book', title: 'AI Research Engine', desc: 'Deep-dive reports on any Indian stock with AI-generated analysis and ratings.' },
              { icon: 'currency_exchange', title: 'Paper Trading', desc: 'Risk-free strategy validation with live market prices. Simulates real brokerage costs.' },
              { icon: 'mail', title: 'Smart Email Digests', desc: 'Automated market updates every few hours — Nifty movers, watchlist, AI commentary.' },
              { icon: 'notifications_active', title: 'Real-Time Alerts', desc: 'Price alerts, RSI signals, MA crossovers — get notified instantly via email.' },
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-10 rounded-2xl hover:shadow-elevated transition-all">
                <div className="w-12 h-12 bg-[#1A4D2E]/5 rounded-xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-[#1A4D2E] text-[22px]">{feature.icon}</span>
                </div>
                <h3 className="font-ui text-lg font-bold text-[#00361a] mb-3">{feature.title}</h3>
                <p className="font-body text-[#4A5568] leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-8 bg-[#f5f4f0]">
        <div className="container mx-auto max-w-[1320px]">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl text-[#00361a]">Institutional Access</h2>
            <p className="font-body text-[#4A5568] mt-4 text-lg">Flexible plans for every level of investor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Explorer', price: 'Free', features: ['5 Backtests/month', 'Basic Screener', 'Daily Digest'] },
              { name: 'Researcher', price: '₹499', features: ['20 Backtests/month', 'Full Screener', 'AI Rationale', '4hr Digest'], popular: false },
              { name: 'Pro Analyst', price: '₹1,499', features: ['Unlimited Backtests', 'Portfolio Analytics', '1hr Digest', 'Priority Support'], popular: true },
              { name: 'Institution', price: '₹4,999', features: ['API Access', '5 Team Seats', 'Custom Branding', 'Dedicated Support'] },
            ].map((plan, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 border-2 ${plan.popular ? 'border-[#1A4D2E] scale-105 shadow-elevated' : 'border-stone-200'} relative`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#795900] px-4 py-1.5 text-[9px] font-bold text-white uppercase rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <div className="font-ui text-[10px] uppercase tracking-widest mb-2 text-stone-400">{plan.name}</div>
                <div className="font-headline text-3xl text-[#00361a] mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="material-symbols-outlined text-[16px] text-[#16A34A]">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`w-full py-3.5 rounded-lg font-ui text-sm font-bold text-center block ${plan.popular ? 'bg-[#1A4D2E] text-white' : 'border-2 border-[#1A4D2E] text-[#1A4D2E]'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1A14] text-white pt-20 pb-10 px-8">
        <div className="container mx-auto max-w-[1320px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <h4 className="font-headline italic text-2xl mb-4">AlgoVeda</h4>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Precision engineering for the modern Indian investor.
              </p>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-6">Platform</h5>
              <ul className="space-y-3 text-stone-400 text-sm">
                <li><Link href="/screener" className="hover:text-white">Screener</Link></li>
                <li><Link href="/backtest" className="hover:text-white">Backtest</Link></li>
                <li><Link href="/paper-trade" className="hover:text-white">Paper Trading</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-6">Company</h5>
              <ul className="space-y-3 text-stone-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-ui text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-6">Newsletter</h5>
              <form onSubmit={handleNewsletter} className="flex">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="bg-white/5 border border-white/10 text-sm flex-grow px-3 py-2 rounded-l-lg" />
                <button className="bg-[#D4A843] text-[#0F1A14] px-4 py-2 font-ui text-xs font-bold rounded-r-lg">Join</button>
              </form>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-[10px] text-stone-600">
            © 2026 AlgoVeda. Not SEBI advisory. For educational purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}