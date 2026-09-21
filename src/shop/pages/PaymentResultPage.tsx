import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { t } from '../../i18n';

/** To'lov tizimidan qaytgan sahifa: ?order=ID — holatni tekshiradi (callback asinxron kelishi mumkin). */
export const PaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order') || '';
  const [st, setSt] = useState<{ number: string; payment_status: string; total: string } | null>(null);

  useEffect(() => {
    let tries = 0;
    const tick = async () => {
      try { const s = await api.paymentStatus(orderId); setSt(s); if (s.payment_status === 'paid' || tries++ > 10) return; } catch { return; }
      setTimeout(tick, 3000);
    };
    if (orderId) tick();
  }, [orderId]);

  const paid = st?.payment_status === 'paid';
  return (
    <div className="max-w-md mx-auto text-center space-y-4 py-10">
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${paid ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
        {paid ? <Check className="w-8 h-8 text-emerald-400" /> : <Clock className="w-8 h-8 text-amber-400" />}
      </div>
      <h1 className="text-2xl font-black text-slate-900">{paid ? t("To'lov qabul qilindi") : t("To'lov tekshirilmoqda...")}</h1>
      {st && <div className="text-slate-600 text-sm">{st.number} · {Number(st.total).toLocaleString()} so'm</div>}
      {!paid && <div className="text-xs text-slate-400">{t("To'lov tasdig'i bir necha soniyada keladi. Sahifani yopmang.")}</div>}
      <Link to={`/orders/${orderId}`} className="inline-block px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold">{t("Buyurtmani ko'rish")}</Link>
    </div>
  );
};
