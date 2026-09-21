import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { api, Order } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { AccountLayout } from '../AccountLayout';
import { t } from '../../i18n';

/** Holat rangi (Uzum uslubi: yengil fon + to'q matn). */
export const STATUS: Record<string, string> = {
  new: 'text-sky-700 bg-sky-50',
  confirmed: 'text-cyan-700 bg-cyan-50',
  printing: 'text-violet-700 bg-violet-50',
  sewing: 'text-indigo-700 bg-indigo-50',
  ready: 'text-amber-700 bg-amber-50',
  shipped: 'text-orange-700 bg-orange-50',
  delivered: 'text-emerald-700 bg-emerald-50',
  cancelled: 'text-rose-700 bg-rose-50',
};

const money = (v: string | number) => Number(v).toLocaleString('uz-UZ') + " so'm";
const when = (v: string) => new Date(v).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });

export const OrdersPage: React.FC = () => {
  const user = useShopStore((s) => s.user);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => { if (user) api.orders().then(setOrders).catch(() => setOrders([])); }, [user]);

  return (
    <AccountLayout title={t('Buyurtmalarim')}>
      {orders === null ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
        </div>
      ) : orders.length ? (
        <div className="space-y-3">
          {orders.map((o) => {
            const items: any[] = o.items || [];

            return (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="block bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-[0_10px_24px_-14px_rgba(15,23,42,0.25)] transition"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS[o.status] || 'bg-slate-100 text-slate-700'}`}>
                    {o.status_label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{o.number}</span>
                  <span className="text-xs text-slate-500">{when(o.created_at)}</span>
                  <span className="ml-auto font-black text-slate-900">{money(o.total)}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {items.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {items.slice(0, 5).map((it, i) => (
                      <span key={i} className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {it.thumbnail
                          ? <img src={it.thumbnail} alt="" className="w-full h-full object-contain p-1" />
                          : <Package className="w-5 h-5 text-slate-300" />}
                      </span>
                    ))}
                    {items.length > 5 && (
                      <span className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                        +{items.length - 5}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 ml-1 truncate">
                      {items.map((it) => it.product_name).filter(Boolean).slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-2xl">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-slate-600">{t("Hali buyurtma yo'q.")}</div>
          <Link to="/ready" className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">{t('Tayyor mahsulotlar')}</Link>
        </div>
      )}
    </AccountLayout>
  );
};
