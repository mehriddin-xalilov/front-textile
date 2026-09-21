import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, Order } from '../../services/api';
import { STATUS } from './OrdersPage';
import { t } from '../../i18n';

const money = (v: string | number) => Number(v).toLocaleString('uz-UZ') + " so'm";
const STEPS = ['new', 'confirmed', 'printing', 'sewing', 'ready', 'shipped', 'delivered'];
const LABEL: Record<string, string> = { new: 'Yangi', confirmed: 'Tasdiqlandi', printing: 'Bosilmoqda', sewing: 'Tikilmoqda', ready: 'Tayyor', shipped: "Jo'natildi", delivered: 'Yetkazildi', cancelled: 'Bekor qilindi' };

/** Buyurtma: holat yo'li, pozitsiyalar (preview bilan), bekor qilish (faqat "new"). */
export const OrderPage: React.FC = () => {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.order(id).then(setOrder).catch(() => setOrder(null));
  useEffect(() => { load(); }, [id]);

  if (!order) return <div className="text-slate-500 text-sm">{t('Yuklanmoqda...')}</div>;
  const idx = STEPS.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{order.number}</h1>
          <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString('uz-UZ')}</div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${STATUS[order.status] || ''}`}>{order.status_label}</span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full ${i <= idx ? 'bg-primary-500' : 'bg-slate-100'}`} />
              <div className={`text-[10px] ${i <= idx ? 'text-primary-600' : 'text-slate-400'}`}>{t(LABEL[s])}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-200">
        {order.items?.map((i: any) => (
          <div key={i.id} className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
              {i.design?.preview?.src ? <img src={i.design.preview.src} alt="" className="w-full h-full object-contain" /> : <span className="text-[10px] text-slate-400">logosiz</span>}
            </div>
            <div className="flex-1">
              <div className="text-slate-900 font-semibold">{i.product_name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-slate-200 inline-block" style={{ background: i.color_hex }} />{i.color_name} · {i.size_name} · {i.quantity} {t('dona')}</div>
            </div>
            <div className="text-slate-900 font-bold">{money(i.total_price)}</div>
          </div>
        ))}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">{order.recipient_name} · {order.delivery_address}</div>
          <div className="text-xl font-black text-slate-900">{money(order.total)}</div>
        </div>
      </div>

      {order.status === 'new' && (
        <button disabled={busy} onClick={async () => { setBusy(true); try { await api.cancelOrder(order.id); await load(); } finally { setBusy(false); } }} className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-300 text-sm hover:bg-rose-500/10">{t('Buyurtmani bekor qilish')}</button>
      )}
    </div>
  );
};
