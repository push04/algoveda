'use client';

import { useState, useEffect, useCallback } from 'react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  limits: Record<string, number>;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_PLAN: Omit<Plan, 'id'> = {
  name: '',
  slug: '',
  price_monthly: 0,
  price_yearly: null,
  features: [],
  limits: {},
  is_active: true,
  sort_order: 0,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<Omit<Plan, 'id'>>(EMPTY_PLAN);
  const [featuresText, setFeaturesText] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch {
      showToast('Failed to load plans', false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setForm(EMPTY_PLAN);
    setFeaturesText('');
    setEditing(null);
    setModal('create');
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({ ...plan });
    setFeaturesText(plan.features.join('\n'));
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: featuresText.split('\n').map(f => f.trim()).filter(Boolean),
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      };

      let res: Response;
      if (modal === 'edit' && editing) {
        res = await fetch('/api/admin/plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(modal === 'edit' ? 'Plan updated!' : 'Plan created!');
      setModal(null);
      fetchPlans();
    } catch (err: any) {
      showToast(err.message ?? 'Save failed', false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Plan deleted');
      setDeleteConfirm(null);
      fetchPlans();
    } catch (err: any) {
      showToast(err.message ?? 'Delete failed', false);
    }
  };

  const formatPrice = (paise: number) => paise === 0 ? 'Free' : `₹${(paise / 100).toLocaleString('en-IN')}/mo`;

  return (
    <main className="pt-24 px-8 pb-16">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-xl font-ui text-sm text-white flex items-center gap-2 transition-all ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Admin Panel</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Subscription Plans</h2>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A4D2E] text-white px-6 py-3 font-ui font-bold text-sm hover:bg-[#143D24] transition-colors shadow-lg shadow-[#1A4D2E]/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Plan
        </button>
      </div>

      {/* Plans Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden shadow-card border border-stone-100">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Plan Name','Price (Monthly)','Price (Yearly)','Features', 'Status','Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-ui font-bold uppercase tracking-widest text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-ui font-bold text-sm text-on-surface">{plan.name}</div>
                    <div className="text-[10px] font-data text-stone-400">{plan.slug}</div>
                  </td>
                  <td className="px-6 py-4 font-data text-sm font-bold text-[#00361a]">
                    {formatPrice(plan.price_monthly)}
                  </td>
                  <td className="px-6 py-4 font-data text-sm text-stone-500">
                    {plan.price_yearly ? `₹${(plan.price_yearly / 100).toLocaleString('en-IN')}/yr` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(plan.features ?? []).slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[9px] bg-stone-100 px-2 py-0.5 rounded font-ui text-stone-600">{f}</span>
                      ))}
                      {plan.features?.length > 3 && (
                        <span className="text-[9px] text-stone-400">+{plan.features.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(plan)} className="p-1.5 hover:bg-stone-100 rounded transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-stone-500">edit</span>
                      </button>
                      <button onClick={() => setDeleteConfirm(plan.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-[48px] text-stone-200 block mb-2">inventory</span>
                    <p className="text-stone-400 font-ui">No plans yet. Create your first plan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-[#1A4D2E] px-6 py-4 flex items-center justify-between">
              <h3 className="font-headline text-white text-xl">{modal === 'edit' ? 'Edit Plan' : 'Create Plan'}</h3>
              <button onClick={() => setModal(null)} className="text-white/70 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Plan Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                    placeholder="Pro Analyst"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm font-data focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                    placeholder="pro-analyst"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={form.price_monthly / 100}
                    onChange={e => setForm(p => ({ ...p, price_monthly: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                    className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                    placeholder="1499"
                    min="0"
                  />
                  <div className="text-[9px] text-stone-400 mt-1">{form.price_monthly} paise</div>
                </div>
                <div>
                  <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Yearly Price (₹)</label>
                  <input
                    type="number"
                    value={form.price_yearly ? form.price_yearly / 100 : ''}
                    onChange={e => setForm(p => ({ ...p, price_yearly: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null }))}
                    className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                    placeholder="14999 (optional)"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Features (one per line)</label>
                <textarea
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                  rows={6}
                  className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 resize-none"
                  placeholder="Unlimited Backtests&#10;Real-time Data&#10;AI Research Reports&#10;Priority Support"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-ui font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-stone-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[#1A4D2E]"
                    />
                    <span className="text-sm font-ui text-stone-700">Active / Visible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 font-ui text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="px-6 py-2.5 bg-[#1A4D2E] text-white font-ui font-bold text-sm rounded-lg hover:bg-[#143D24] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : (modal === 'edit' ? 'Update Plan' : 'Create Plan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-red-400 mb-4 block">warning</span>
            <h3 className="font-headline text-xl text-on-surface mb-2">Delete Plan?</h3>
            <p className="text-stone-500 text-sm mb-6">This cannot be undone. Active subscribers on this plan will keep their access until expiry.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border border-stone-200 rounded-lg font-ui text-sm hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-ui font-bold text-sm hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
