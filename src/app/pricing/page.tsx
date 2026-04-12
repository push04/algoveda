'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLAN_ICONS: Record<string, string> = {
  starter: 'school',
  explorer: 'explore',
  researcher: 'science',
  pro: 'star',
  institution: 'apartment',
};

const PLAN_COLORS: Record<string, string> = {
  starter: 'amber',
  explorer: 'stone',
  researcher: 'blue',
  pro: 'amber',
  institution: 'green',
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paying, setPaying] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Load Razorpay script early
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }

    // Load plans
    fetch('/api/admin/plans').then(r => r.json()).then(data => {
      const sorted = (data.plans ?? [])
        .filter((p: Plan) => p.slug !== 'institution')
        .sort((a: Plan, b: Plan) => {
          if (a.slug === 'starter') return -1;
          if (b.slug === 'starter') return 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
      setPlans(sorted);
      setLoading(false);
    });

    // Resolve current session immediately — avoids race condition where user is null on first render
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', u.id).single();
        setUser({ id: u.id, email: u.email, name: profile?.full_name });
      }
      setUserLoading(false);
    });

    // Also watch for auth changes (login/logout while page is open)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', u.id).single();
        setUser({ id: u.id, email: u.email, name: profile?.full_name });
      } else {
        setUser(null);
      }
      setUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePurchase = async (plan: Plan) => {
    // Wait for session check to complete before deciding to redirect
    if (userLoading) return;
    if (!user) {
      window.location.href = `/auth/login?redirect=/pricing`;
      return;
    }

    if (plan.price_monthly === 0) {
      showToast('You are already on the Explorer (free) plan!');
      return;
    }

    // Check if already subscribed to this plan
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .eq('plan_id', plan.id)
      .maybeSingle();

    if (existingSub?.status) {
      showToast(`You already have an active ${plan.name} subscription!`);
      if (plan.slug === 'starter') {
        setTimeout(() => { window.location.href = '/learn'; }, 1500);
      } else {
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      }
      return;
    }

    setPaying(plan.id);

    try {
      // Create Razorpay order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, billingCycle }),
      });
      const order = await res.json();
      if (!res.ok) {
        showToast(order.error ?? 'Failed to create order', false);
        setPaying(null);
        return;
      }

      // Wait for Razorpay to be ready
      if (typeof window.Razorpay === 'undefined') {
        // Try loading again
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.body.appendChild(script);
          setTimeout(resolve, 3000);
        });
      }

      if (typeof window.Razorpay === 'undefined') {
        showToast('Payment SDK failed to load. Please disable ad-blockers and try again.', false);
        setPaying(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'AlgoVeda',
        description: `${order.planName} Plan`,
        order_id: order.orderId,
        prefill: { email: user.email, name: user.name },
        theme: { color: '#1A4D2E' },
        modal: {
          ondismiss: () => {
            setPaying(null);
          },
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                billingCycle,
              }),
            });
            const result = await verifyRes.json();
            if (result.success) {
              showToast(`🎉 ${plan.name} plan activated! Redirecting...`);
              setTimeout(() => {
                window.location.href = plan.slug === 'starter' ? '/learn' : '/dashboard';
              }, 2000);
            } else {
              showToast(result.error ?? 'Payment verification failed', false);
            }
          } catch {
            showToast('Payment processing error. Please contact support.', false);
          }
          setPaying(null);
        },
      });

      rzp.on('payment.failed', (response: any) => {
        showToast(`Payment failed: ${response.error?.description ?? 'Unknown error'}`, false);
        setPaying(null);
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment';
      showToast(msg, false);
      setPaying(null);
    }
  };

  const getPrice = (plan: Plan) => {
    if (plan.price_monthly === 0) return 'Free';
    // price_monthly is stored in paise — divide by 100 to get rupees
    const amount = billingCycle === 'yearly' && plan.price_yearly
      ? plan.price_yearly / 12
      : plan.price_monthly;
    return `₹${(amount / 100).toLocaleString('en-IN')}`;
  };

  const getSavings = (plan: Plan) => {
    if (!plan.price_yearly || plan.price_monthly === 0) return null;
    const monthly12 = plan.price_monthly * 12;
    const saved = monthly12 - plan.price_yearly;
    const pct = Math.round((saved / monthly12) * 100);
    return pct > 0 ? `Save ${pct}%` : null;
  };

  const colorClass = (slug: string) => ({
    stone: { border: 'border-stone-200', btn: 'bg-stone-700 hover:bg-stone-800 text-white', badge: 'bg-stone-100 text-stone-600', icon: 'text-stone-600 bg-stone-100' },
    blue: { border: 'border-blue-200', btn: 'bg-blue-700 hover:bg-blue-800 text-white', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600 bg-blue-100' },
    amber: { border: 'border-amber-300 ring-2 ring-amber-300', btn: 'bg-[#D4A843] hover:bg-[#C8A040] text-[#0F1A14]', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600 bg-amber-100' },
    green: { border: 'border-[#1A4D2E]/30', btn: 'bg-[#1A4D2E] hover:bg-[#143D24] text-white', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-[#1A4D2E] bg-emerald-100' },
  }[PLAN_COLORS[slug] ?? 'stone'] ?? { border: 'border-stone-200', btn: 'bg-stone-700 hover:bg-stone-800 text-white', badge: 'bg-stone-100 text-stone-600', icon: 'text-stone-600 bg-stone-100' });

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-ui text-sm text-white flex items-center gap-2 animate-fade-in-down ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A4D2E] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <span className="font-headline italic text-lg text-[#1A4D2E] font-bold">AlgoVeda</span>
        </Link>
        <div className="flex gap-3">
          {user ? (
            <Link href="/dashboard" className="px-4 py-2 bg-[#1A4D2E] text-white text-sm font-ui font-bold rounded-lg hover:bg-[#143D24] transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-sm font-ui text-stone-600 hover:text-stone-900">Sign in</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-[#1A4D2E] text-white text-sm font-ui font-bold rounded-lg hover:bg-[#143D24] transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="pt-24 pb-24 px-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="inline-block text-[10px] font-ui font-bold uppercase tracking-[0.3em] text-[#795900] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mb-4">
            Transparent Pricing
          </span>
          <h1 className="text-5xl font-headline text-[#00361a] mb-4">
            Institutional Intelligence.<br />
            <span className="text-gradient-gold">Retail Price.</span>
          </h1>
          <p className="text-lg text-stone-600 font-body max-w-xl mx-auto">
            Start with our ₹2 Starter plan — includes full stock market education &amp; paper trading. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="glass-panel rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-ui font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#1A4D2E] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-ui font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[#1A4D2E] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Yearly
              <span className="text-[9px] font-bold bg-amber-400 text-[#0F1A14] px-1.5 py-0.5 rounded-full">Up to 20% off</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-[500px] skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 stagger-children">
            {plans.filter(p => p.is_active).map((plan) => {
              const cc = colorClass(plan.slug);
              const savings = getSavings(plan);
              const isPopular = plan.slug === 'starter';
              const isPro = plan.slug === 'pro';
              return (
                <div key={plan.id} className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative card-hover-lift ${cc.border} ${plan.slug === 'starter' ? 'lg:col-span-2' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D4A843] text-[#0F1A14] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                      ⭐ Start Here
                    </div>
                  )}
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1A4D2E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cc.icon}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {PLAN_ICONS[plan.slug] ?? 'workspace_premium'}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-headline text-xl text-[#00361a] mb-1">{plan.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-data font-bold text-stone-800">{getPrice(plan)}</span>
                      {plan.price_monthly > 0 && plan.slug !== 'starter' && (
                        <span className="text-stone-400 text-sm font-body">/mo</span>
                      )}
                      {plan.slug === 'starter' && (
                        <span className="text-stone-400 text-sm font-body">one-time</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && savings && (
                      <span className="text-xs font-ui text-emerald-600 font-bold">{savings} · Billed annually</span>
                    )}
                    {plan.price_monthly === 0 && (
                      <span className="text-xs font-ui text-stone-400">No credit card required</span>
                    )}
                    {plan.slug === 'starter' && (
                      <p className="text-xs text-amber-700 font-ui font-bold mt-1">✓ Razorpay secured payment</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-body text-stone-600">
                        <span className="material-symbols-outlined text-[14px] text-emerald-500 flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={paying === plan.id}
                    className={`w-full py-3 text-sm font-ui font-bold rounded-xl transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2 ${cc.btn}`}
                  >
                    {paying === plan.id ? (
                      <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : plan.price_monthly === 0 ? (
                      user ? 'Current Plan' : 'Get Started Free'
                    ) : plan.slug === 'starter' ? (
                      <><span className="material-symbols-outlined text-[16px]">lock_open</span> Unlock for ₹2</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px]">payments</span> Subscribe Now</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="gradient-divider mb-8" />
          <div className="grid grid-cols-3 gap-8 text-sm">
            {[
              { icon: 'lock', title: 'Secure Payments', desc: 'Powered by Razorpay — PCI DSS compliant, 256-bit SSL encryption' },
              { icon: 'cancel', title: 'Cancel Anytime', desc: 'No long-term commitment. Cancel or downgrade at any time without penalties' },
              { icon: 'support_agent', title: 'Priority Support', desc: 'Pro and Institution subscribers get dedicated support within 2 hours' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <span className="material-symbols-outlined text-[28px] text-[#1A4D2E] mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <h4 className="font-ui font-bold text-stone-700 mb-1">{title}</h4>
                <p className="text-xs text-stone-500 font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
