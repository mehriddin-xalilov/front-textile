import React, { useEffect, useState } from 'react';
import { Check, Phone } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { AccountLayout } from '../AccountLayout';
import { t } from '../../i18n';

/** Shaxsiy ma'lumotlar: ism, familiya, email. Telefon kirish uchun ishlatiladi, o'zgarmaydi. */
export const ProfilePage: React.FC = () => {
  const user = useShopStore((s) => s.user);
  const setUser = useShopStore((s) => s.setUser);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' });
  }, [user]);

  const input = 'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setSaved(false);
    try {
      const updated = await api.updateProfile({ ...form, email: form.email || undefined });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e2) {
      const ae = e2 as ApiError;
      setErr(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountLayout title={t("Ma'lumotlarim")}>
      <form onSubmit={save} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">{t('Ism')}</label>
            <input className={input} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">{t('Familiya')}</label>
            <input className={input} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">{t('Telefon')}</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
              <Phone className="w-4 h-4" /> {user?.phone_number}
            </div>
          </div>
        </div>
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <div className="flex items-center gap-3">
          <button disabled={busy} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-60">
            {t('Saqlash')}
          </button>
          {saved && <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><Check className="w-4 h-4" /> {t('Saqlandi')}</span>}
        </div>
      </form>
    </AccountLayout>
  );
};
