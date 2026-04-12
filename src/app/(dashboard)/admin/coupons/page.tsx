'use client';

import { useState, useEffect, useCallback } from 'react';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

const EMPTY_COUPON: Omit<Coupon, 'id' | 'created_at'> = {
  code: '',
  description: '',
  discount_percent: 0,
  valid_until: '',
  max_uses: 100,
  current_uses: 0,
  is_active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch {
      showToast('Failed to load coupons', false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleSave = async () => {
    if (!form.code) { showToast('Code is required', false); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      const data = await res.json();
      if (data.coupon || res.ok) {
        showToast(editing ? 'Coupon updated' : 'Coupon created');
        setModal(null);
        setEditing(null);
        setForm(EMPTY_COUPON);
        fetchCoupons();
      } else {
        showToast(data.error || 'Failed', false);
      }
    } catch {
      showToast('Error saving coupon', false);
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });
      fetchCoupons();
    } catch { showToast('Failed to update', false); }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Coupon deleted');
      fetchCoupons();
    } catch { showToast('Failed to delete', false); }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-headline text-3xl text-primary">Manage Coupons</h1>
            <p className="text-stone-500">Create and manage discount codes</p>
          </div>
          <button onClick={() => { setEditing(null); setForm(EMPTY_COUPON); setModal('create'); }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-ui hover:bg-primary/90">
            + Create Coupon
          </button>
        </div>

        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl ${toast.ok ? 'bg-green-600' : 'bg-red-600'} text-white font-ui text-sm animate-fadeIn`}>
            {toast.msg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="text-left p-4 font-ui text-sm text-stone-500">Code</th>
                  <th className="text-left p-4 font-ui text-sm text-stone-500">Description</th>
                  <th className="text-left p-4 font-ui text-sm text-stone-500">Discount</th>
                  <th className="text-left p-4 font-ui text-sm text-stone-500">Uses</th>
                  <th className="text-left p-4 font-ui text-sm text-stone-500">Status</th>
                  <th className="text-right p-4 font-ui text-sm text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-stone-400">No coupons yet</td></tr>
                ) : coupons.map(c => (
                  <tr key={c.id} className="border-b hover:bg-stone-50">
                    <td className="p-4 font-mono font-bold text-primary">{c.code}</td>
                    <td className="p-4 text-stone-600">{c.description || '-'}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded font-bold">{c.discount_percent}% OFF</span></td>
                    <td className="p-4 text-stone-600">{c.current_uses}/{c.max_uses}</td>
                    <td className="p-4">
                      <button onClick={() => toggleActive(c.id, c.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-500'}`}>
                        {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description, discount_percent: c.discount_percent, valid_until: c.valid_until || '', max_uses: c.max_uses, current_uses: c.current_uses, is_active: c.is_active }); setModal('edit'); }}
                        className="px-3 py-1 text-primary hover:bg-primary/10 rounded mr-2">Edit</button>
                      <button onClick={() => deleteCoupon(c.id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="font-headline text-2xl mb-6">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-stone-500 mb-1">Code *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full p-3 border rounded-lg font-mono" placeholder="e.g. SUMMER20" /></div>
              <div><label className="block text-sm text-stone-500 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border rounded-lg" placeholder="e.g. Summer sale" /></div>
              <div><label className="block text-sm text-stone-500 mb-1">Discount % *</label>
                <input type="number" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg" /></div>
              <div><label className="block text-sm text-stone-500 mb-1">Max Uses</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg" /></div>
              <div><label className="block text-sm text-stone-500 mb-1">Valid Until</label>
                <input type="datetime-local" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full p-3 border rounded-lg" /></div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-3 bg-stone-200 rounded-lg font-ui">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary text-white rounded-lg font-ui hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}