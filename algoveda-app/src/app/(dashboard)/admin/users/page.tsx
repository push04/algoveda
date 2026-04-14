'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  quiz_score: number | null;
  education_unlocked: boolean | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const limit = 20;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      showToast('Failed to load users', false);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleAdmin = async (id: string, current: boolean) => {
    const confirmed = confirm(`${current ? 'Remove' : 'Grant'} admin access for this user?`);
    if (!confirmed) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_admin: !current }),
      });
      if (res.ok) {
        showToast(`Admin access ${current ? 'removed' : 'granted'}`);
        fetchUsers();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed', false);
      }
    } catch {
      showToast('Error updating user', false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1400px] mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-ui text-sm text-white flex items-center gap-2 ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Admin Panel</span>
        <h1 className="text-4xl font-headline text-[#00361a] mt-1">Users</h1>
        <p className="text-stone-500 font-body text-sm mt-1">
          {loading ? 'Loading...' : `${total.toLocaleString()} registered users`}
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm font-body text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A4D2E] text-white rounded-xl text-sm font-ui font-bold hover:bg-[#143D24] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-[#1A4D2E] rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-stone-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">person_search</span>
            No users found {search && `for "${search}"`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/80">
                  <th className="text-left px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">User</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Email</th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Role</th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Quiz Score</th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Paper Trading</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Joined</th>
                  <th className="text-center px-5 py-3.5 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A4D2E]/10 flex items-center justify-center text-[#1A4D2E] text-sm font-bold font-ui flex-shrink-0">
                          {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-ui font-bold text-stone-800 text-sm">{u.full_name || '—'}</p>
                          <p className="font-data text-[10px] text-stone-400">{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-stone-600">{u.email || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-ui ${
                        u.is_admin ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {u.is_admin ? 'shield' : 'person'}
                        </span>
                        {u.is_admin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-data font-bold text-sm ${
                        (u.quiz_score ?? 0) >= 15 ? 'text-emerald-600' : 'text-stone-500'
                      }`}>
                        {u.quiz_score ?? 0}/20
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                        u.education_unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {u.education_unlocked ? '✓' : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-data text-xs text-stone-400">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-ui font-bold border transition-all ${
                          u.is_admin
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-stone-100 flex items-center justify-between">
            <p className="text-xs font-data text-stone-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} users
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-ui font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs font-data text-stone-500 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-ui font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
