'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Make sure we have a session (user clicked link from email)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="glass-panel p-8 rounded-2xl shadow-elevated">
            <div className="w-16 h-16 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#16A34A] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-headline text-2xl text-[#0F1A14] mb-2">Password Updated!</h1>
            <p className="font-body text-[#4A5568] mb-6">
              Your password has been changed successfully. Redirecting to dashboard...
            </p>
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
          <h1 className="font-headline text-3xl text-[#0F1A14] mb-2">Set New Password</h1>
          <p className="font-body text-[#4A5568]">Choose a strong password</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-elevated">
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                New Password
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
              disabled={loading || !!error || password.length < 8}
              className="w-full py-3.5 bg-[#1A4D2E] text-white font-ui font-bold rounded-lg hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
