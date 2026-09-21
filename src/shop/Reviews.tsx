import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { api, Review, ReviewSummary } from '../services/api';
import { useShopStore } from '../store/shopStore';
import { t } from '../i18n';

/**
 * Yulduzlar qatori. `value` kasr bo'lishi mumkin (4.3) — yulduz qisman to'ladi.
 * `onPick` berilsa: bosiladi, sichqoncha ustida turganda oldindan ko'rsatadi.
 */
export const Stars: React.FC<{ value: number; size?: number; onPick?: (v: number) => void }> = ({ value, size = 16, onPick }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, shown - i + 1));   // 0..1
        const star = (
          <span className="relative inline-block" style={{ width: size, height: size }}>
            <Star style={{ width: size, height: size }} className="absolute inset-0 text-slate-200 fill-slate-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star style={{ width: size, height: size }} className="text-amber-400 fill-amber-400" />
            </span>
          </span>
        );

        return onPick ? (
          <button
            key={i}
            type="button"
            aria-label={`${i}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onPick(i)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </span>
  );
};

/** Reyting bloki: o'rtacha baho, yulduzlar taqsimoti, sharhlar va baho qoldirish. */
export const Reviews: React.FC<{ productId?: number; designId?: number; readyProductId?: number }> = ({ productId, designId, readyProductId }) => {
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const [items, setItems] = useState<Review[]>([]);
  const [sum, setSum] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = { product_id: productId, design_id: designId, ready_product_id: readyProductId };
  const load = () => {
    api.reviews(q).then(setItems).catch(() => {});
    api.reviewSummary(q).then(setSum).catch(() => {});
  };
  useEffect(load, [productId, designId, readyProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    setBusy(true); setMsg(null);
    try {
      await api.createReview({ ...q, rating, comment: comment.trim() || undefined });
      setDone(true); setComment('');
      load();
    } catch (err: any) {
      setMsg(err?.message || t('Xatolik'));
    } finally {
      setBusy(false);
    }
  };

  const count = sum?.count || 0;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('Sharhlar')}</h2>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="text-center sm:pr-6 sm:border-r border-slate-200">
          <div className={`text-4xl font-black leading-none ${count ? 'text-slate-900' : 'text-slate-300'}`}>{count ? sum?.average?.toFixed(1) : '0.0'}</div>
          <div className="mt-2"><Stars value={sum?.average || 0} size={18} /></div>
          <div className="text-xs text-slate-500 mt-1.5">{count} {t('ta sharh')}</div>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((r) => {
            const n = Number(sum?.breakdown?.[String(r)] || 0);
            const pct = count ? (n / count) * 100 : 0;

            return (
              <div key={r} className="flex items-center gap-2.5 text-xs">
                <span className="w-3 text-slate-500 tabular-nums">{r}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <span className="block h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right text-slate-500 tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} size={14} />
                <span className="text-sm font-semibold text-slate-900">{r.author}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(r.created_at).toLocaleDateString('uz-UZ')}</span>
              </div>
              {r.comment && <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{r.comment}</p>}
              {r.reply && (
                <div className="mt-3 pl-3 border-l-2 border-primary-200 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Textile:</span> {r.reply}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {done ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl p-4">
          {t('Sharhingiz qabul qilindi — tekshiruvdan keyin chiqadi.')}
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{t('Bahoyingiz')}</span>
            <Stars value={rating} size={26} onPick={setRating} />
            <span className="text-sm font-bold text-slate-900">{rating}.0</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={t('Mahsulot haqida fikringiz')}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500"
          />
          {msg && <div className="text-sm text-rose-600">{msg}</div>}
          <button
            disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-60"
          >
            {user ? t('Yuborish') : t('Kirish va sharh qoldirish')}
          </button>
        </form>
      )}
    </section>
  );
};
