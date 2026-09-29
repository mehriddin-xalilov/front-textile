import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, RotateCcw, ShieldCheck, ShoppingBag, Trash2, Truck, CreditCard } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useShopStore } from '../../store/shopStore';
import { t } from '../../i18n';
import { QtyInput } from '../QtyInput';
import { PayPicker, PayMethod } from '../PayPicker';
import { money } from '../ReadyCard';
import { AddressPicker } from '../AddressPicker';

/** Savat: tayyor mahsulotlar ro'yxati, soni, to'lov va buyurtma. */
export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const total = lines.reduce((n, l) => n + Number(l.price) * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  const [pay, setPay] = useState<PayMethod>('payme');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number; number: string; total: string } | null>(null);

  const order = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    setBusy(true); setErr(null);
    try {
      const created = await api.createOrder({
        items: lines.map((l) => ({ ready_product_id: l.readyProductId, quantity: l.qty, size: l.size })),
        recipient_name: form.name || user.full_name,
        recipient_phone: form.phone || user.phone_number,
        delivery_address: form.address,
        payment_method: pay,
      });
      setDone(created);
      clear();
      window.location.href = await api.payUrl(created.id, pay);
    } catch (e2) {
      const ae = e2 as ApiError;
      setErr(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <Check className="w-10 h-10 text-emerald-600 mx-auto" />
        <div className="text-lg font-bold text-slate-900">{done.number}</div>
        <div className="text-slate-600">{money(done.total)}</div>
        <button onClick={() => navigate(`/orders/${done.id}`)} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">
          {t("Buyurtmani ko'rish")}
        </button>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <div className="text-slate-600">{t("Savat bo'sh")}</div>
        <Link to="/ready" className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">{t('Tayyor mahsulotlar')}</Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{itemCount} {t('ta mahsulot savatda')}</h1>
          <button onClick={clear} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition">
            <Trash2 className="w-4 h-4" /> {t('Savatni tozalash')}
          </button>
        </div>
        {lines.map((l) => (
          <div key={`${l.readyProductId}-${l.size}`} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-4">
            <Link to={`/ready/${l.slug}`} className="w-20 h-20 rounded-xl bg-slate-50 overflow-hidden shrink-0">
              {l.image && <img src={l.image} alt={l.name} className="w-full h-full object-contain" />}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/ready/${l.slug}`} className="font-semibold text-slate-900 truncate block">{l.name}</Link>
              <div className="text-xs text-slate-500">{t('Razmer')}: {l.size}</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{money(l.price)}</div>
            </div>
            <QtyInput value={l.qty} onChange={(v) => setQty(l.readyProductId, l.size, v)} />
            <button onClick={() => remove(l.readyProductId, l.size)} aria-label={t("O'chirish")} className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

      <div className="grid grid-cols-2 gap-3 pt-3">
        {[
          { icon: ShieldCheck, title: t('Xaridor himoyasi'), text: t("100% pulni qaytarish kafolati") },
          { icon: CreditCard, title: t("Xavfsiz to'lov"), text: t('Payme, Click, Uzum') },
          { icon: Truck, title: t('Tezkor yetkazib berish'), text: t('1-3 ish kuni') },
          { icon: RotateCcw, title: t('Oson qaytarish'), text: t('14 kun ichida') },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{f.title}</div>
              <div className="text-xs text-slate-500 truncate">{f.text}</div>
            </div>
          </div>
        ))}
      </div>
      </div>

      <form onSubmit={order} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
        <div className="font-black text-slate-900 text-lg">{t('Buyurtmangiz')}</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500">{t('Mahsulotlar')} ({itemCount})</span>
            <span className="flex-1 border-b border-dotted border-slate-200 translate-y-[-3px]" />
            <span className="font-semibold text-slate-900">{money(total)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500">{t('Yetkazib berish')}</span>
            <span className="flex-1 border-b border-dotted border-slate-200 translate-y-[-3px]" />
            <span className="font-semibold text-emerald-600">{t('Bepul')}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="font-bold text-slate-900">{t('Umumiy narx')}</span>
          <span className="text-xl font-black text-slate-900">{money(total)}</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">{t("To'lov")}</div>
          <PayPicker value={pay} onChange={setPay} />
        </div>
        <AddressPicker value={form} onChange={setForm} />
        {err && <div className="text-sm text-rose-600">{err}</div>}
        <button disabled={busy} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm disabled:opacity-60">
          <ShoppingBag className="w-4 h-4" /> {busy ? '...' : user ? t('Davom etish') : t('Kirish va sotib olish')}
        </button>
      </form>

    </div>
  );
};
