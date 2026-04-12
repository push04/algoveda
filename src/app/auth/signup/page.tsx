'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="glass-panel p-8 rounded-2xl shadow-elevated">
            <div className="w-16 h-16 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#16A34A] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline text-2xl text-[#0F1A14] mb-2">Check your email</h1>
            <p className="font-body text-[#4A5568] mb-6">
              We've sent a confirmation link to <span className="font-bold">{email}</span>
            </p>
            <Link href="/auth/login" className="inline-block py-3 px-6 bg-[#1A4D2E] text-white font-ui font-bold rounded-lg hover:bg-[#143D24] transition-all">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="font-headline text-3xl text-[#0F1A14] mb-2">Create your account</h1>
          <p className="font-body text-[#4A5568]">Start your research journey today</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-elevated">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body text-[#0F1A14] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all"
                required
              />
            </div>

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
              <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs font-body text-[#94A3B8] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-ui font-bold text-[#1A4D2E] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-body text-[#94A3B8] mt-6">
          By signing up, you agree to our{' '}
          <a href="#" className="underline hover:text-[#4A5568]">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-[#4A5568]">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}