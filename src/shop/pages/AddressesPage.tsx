import React, { useEffect, useState } from 'react';
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, Address, ApiError } from '../../services/api';
import { AccountLayout } from '../AccountLayout';
import { useShopStore } from '../../store/shopStore';
import { t } from '../../i18n';

const EMPTY: Partial<Address> = {
  label: '', recipient_name: '', recipient_phone: '', region: '', city: '', street: '', apartment: '', landmark: '', is_default: false,
};

/** Manzillar kitobi: qo'shish, tahrirlash, asosiy qilib belgilash. */
export const AddressesPage: React.FC = () => {
  const user = useShopStore((s) => s.user);
  const [items, setItems] = useState<Address[] | null>(null);
  const [form, setForm] = useState<Partial<Address> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => api.addresses().then(setItems).catch(() => setItems([]));
  useEffect(() => { if (user) load(); }, [user]);

  const input = 'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true); setErr(null);
    try {
      if (form.id) await api.updateAddress(form.id, form);
      else await api.createAddress(form);
      setForm(null);
      await load();
    } catch (e2) {
      const ae = e2 as ApiError;
      setErr(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => { await api.deleteAddress(id); await load(); };
  const makeDefault = async (a: Address) => { await api.updateAddress(a.id, { is_default: true }); await load(); };

  return (
    <AccountLayout title={t('Manzillarim')}>
      {!form && (
        <button
          onClick={() => setForm({ ...EMPTY, recipient_name: user?.full_name || '', recipient_phone: user?.phone_number || '' })}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
        >
          <Plus className="w-4 h-4" /> {t('Yangi manzil')}
        </button>
      )}

      {form && (
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input className={input} placeholder={t('Manzil nomi (Uy, Ish)')} value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input className={input} placeholder={t('Qabul qiluvchi')} value={form.recipient_name || ''} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} required />
            <input className={input} placeholder={t('Telefon (+998...)')} value={form.recipient_phone || ''} onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })} required />
            <input className={input} placeholder={t('Viloyat')} value={form.region || ''} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            <input className={input} placeholder={t('Shahar / tuman')} value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className={input} placeholder={t("Ko'cha, uy")} value={form.street || ''} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
            <input className={input} placeholder={t('Kvartira')} value={form.apartment || ''} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
            <input className={input} placeholder={t("Mo'ljal")} value={form.landmark || ''} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 select-none">
            <input type="checkbox" checked={!!form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4 accent-slate-900" />
            {t('Asosiy manzil')}
          </label>
          {err && <div className="text-sm text-rose-600">{err}</div>}
          <div className="flex gap-2">
            <button disabled={busy} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-60">{t('Saqlash')}</button>
            <button type="button" onClick={() => { setForm(null); setErr(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">{t('Bekor qilish')}</button>
          </div>
        </form>
      )}

      {items === null ? (
        <div className="grid sm:grid-cols-2 gap-3 animate-pulse">
          {[0, 1].map((i) => <div key={i} className="h-32 rounded-2xl bg-slate-100" />)}
        </div>
      ) : items.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((a) => (
            <div key={a.id} className={`relative bg-white border rounded-2xl p-4 ${a.is_default ? 'border-slate-900' : 'border-slate-200'}`}>
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{a.label || t('Manzil')}</span>
                    {a.is_default && <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">{t('Asosiy')}</span>}
                  </div>
                  <div className="text-sm text-slate-600 mt-1 break-words">{a.full}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.recipient_name} · {a.recipient_phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {!a.is_default && (
                  <button onClick={() => makeDefault(a)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t('Asosiy')}
                  </button>
                )}
                <button onClick={() => setForm(a)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1">
                  <Pencil className="w-3.5 h-3.5" /> {t('Tahrirlash')}
                </button>
                <button onClick={() => remove(a.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> {t("O'chirish")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !form && <div className="py-14 text-center text-slate-500 text-sm">{t("Manzil yo'q")}</div>
      )}
    </AccountLayout>
  );
};
