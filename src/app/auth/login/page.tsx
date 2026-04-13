'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const POPULAR_STOCKS = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'SBIN', 'ICICIBANK', 'TITAN', 'WIPRO', 'BAJFINANCE', 'MARUTI'];

interface StockQuote {
  symbol: string;
  price: number;
  changeP: number;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  // Fetch random stock on mount
  useEffect(() => {
    const randomStock = POPULAR_STOCKS[Math.floor(Math.random() * POPULAR_STOCKS.length)];
    fetch(`/api/market/quote?symbol=${randomStock}`)
      .then(r => r.json())
      .then(d => {
        if (d.price) {
          setStockQuote({
            symbol: randomStock,
            price: d.price,
            changeP: d.changeP || 0
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed') || error.message.toLowerCase().includes('email_not_confirmed')) {
        setError('Please confirm your email address first. Check your inbox for a confirmation link from AlgoVeda.');
      } else if (error.message.includes('Invalid login') || error.message.includes('invalid') || error.message.includes('credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Too many requests')) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // Check email_confirmed_at
    if (data?.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Your email is not confirmed yet. Please check your inbox and click the confirmation link before signing in.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#1A4D2E] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <span className="text-3xl font-headline italic font-bold text-[#00361a]">AlgoVeda</span>
          </Link>
          <h1 className="font-headline text-3xl text-[#0F1A14] mb-2">Welcome back</h1>
          {stockQuote && (
            <div className="mt-3 inline-flex items-center gap-3 px-4 py-2 bg-white/60 rounded-lg">
              <span className="font-mono font-bold text-sm">{stockQuote.symbol}</span>
              <span className="font-data font-bold text-sm">Rs {stockQuote.price?.toLocaleString()}</span>
              <span className={`font-data text-xs ${stockQuote.changeP >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockQuote.changeP >= 0 ? '+' : ''}{stockQuote.changeP.toFixed(2)}%
              </span>
            </div>
          )}
          <p className="font-body text-[#4A5568] mt-2">Sign in to access your market intelligence</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-elevated">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body text-[#0F1A14] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-ui font-bold text-[#1A4D2E] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body text-[#0F1A14] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1A4D2E] text-white font-ui font-bold rounded-lg hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E6DF]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#94A3B8] font-body">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 py-3 border border-[#E8E6DF] rounded-lg font-ui text-sm text-[#4A5568] hover:bg-[#F7F6F2] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 py-3 border border-[#E8E6DF] rounded-lg font-ui text-sm text-[#4A5568] hover:bg-[#F7F6F2] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-sm font-body text-[#4A5568] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-ui font-bold text-[#1A4D2E] hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-body text-[#94A3B8] mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="underline hover:text-[#4A5568]">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-[#4A5568]">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen mesh-gradient" />}>
      <LoginForm />
    </Suspense>
  );
}
