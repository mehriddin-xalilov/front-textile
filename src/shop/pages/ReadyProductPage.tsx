import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, X, ZoomIn, Zap } from 'lucide-react';
import { api, ApiError, ReadyProduct } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { useCartStore } from '../../store/cartStore';
import { t } from '../../i18n';
import { PayPicker, PayMethod } from '../PayPicker';
import { QtyInput } from '../QtyInput';
import { Reviews, Stars } from '../Reviews';
import { money } from '../ReadyCard';
import { AddressPicker } from '../AddressPicker';

/** Tayyor mahsulot sahifasi: galereya, xususiyatlar, savat va tezkor sotib olish. */
export const ReadyProductPage: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const addToCart = useCartStore((s) => s.add);
  const favorites = useCartStore((s) => s.favorites);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);

  const [item, setItem] = useState<ReadyProduct | null>(null);
  const [photo, setPhoto] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [pay, setPay] = useState<PayMethod>('payme');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number; number: string; total: string } | null>(null);

  useEffect(() => {
    api.readyProduct(slug).then((p) => { setItem(p); setSize(p.sizes?.[0] || ''); setPhoto(0); }).catch(() => setItem(null));
  }, [slug]);

  // Yuklanayotganda bir xil tuzilishdagi skelet: sahifa "sakramaydi"
  if (!item) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 animate-pulse">
        <div className="aspect-square rounded-3xl bg-slate-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-xl bg-slate-100" />
          <div className="h-4 w-1/3 rounded-lg bg-slate-100" />
          <div className="h-10 w-1/2 rounded-xl bg-slate-100" />
          <div className="space-y-2 pt-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-4 w-full rounded bg-slate-100" />)}
          </div>
          <div className="flex gap-2 pt-2">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-11 w-14 rounded-xl bg-slate-100" />)}
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 flex-1 rounded-2xl bg-slate-100" />
            <div className="h-12 flex-1 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const images = item.images?.length ? item.images : (item.image ? [{ id: 0, src: item.image }] : []);
  const fav = favorites.includes(item.id);
  const discount = item.old_price && Number(item.old_price) > Number(item.price)
    ? Math.round((1 - Number(item.price) / Number(item.old_price)) * 100)
    : 0;
  const input = 'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';
  const step = (d: number) => setPhoto((p) => (p + d + images.length) % Math.max(1, images.length));

  const cart = () => {
    addToCart({ readyProductId: item.id, slug: item.slug, name: item.name, image: item.image, price: item.price, size: size || '—', qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: item.name, url });
      else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); }
    } catch { /* foydalanuvchi bekor qildi */ }
  };

  const buy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    setBusy(true); setErr(null);
    try {
      const order = await api.createOrder({
        items: [{ ready_product_id: item.id, quantity: qty, size: size || undefined }],
        recipient_name: form.name || user.full_name,
        recipient_phone: form.phone || user.phone_number,
        delivery_address: form.address,
        payment_method: pay,
      });
      setDone(order);
      window.location.href = await api.payUrl(order.id, pay);
    } catch (e2) {
      const ae = e2 as ApiError;
      setErr(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
        {/* Galereya */}
        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="flex flex-col gap-2 w-16 sm:w-20 shrink-0 max-h-[560px] overflow-y-auto">
              {images.map((im, i) => (
                <button
                  key={im.id}
                  onClick={() => setPhoto(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white shrink-0 ${i === photo ? 'border-slate-900' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <img src={im.src} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 aspect-square rounded-3xl bg-gradient-to-b from-white to-[#ECEDEF] border border-slate-200 overflow-hidden group">
            {images[photo]
              ? (
                <button type="button" onClick={() => setZoom(true)} className="w-full h-full cursor-zoom-in">
                  <img src={images[photo].src} alt={item.name} className="w-full h-full object-contain" />
                  <span className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </button>
              )
              : <div className="w-full h-full flex items-center justify-center text-slate-400">rasm yo'q</div>}
            {images.length > 1 && (
              <>
                <button onClick={() => step(-1)} aria-label="oldingi" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => step(1)} aria-label="keyingi" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ma'lumot */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <h1 className="flex-1 text-2xl sm:text-3xl font-black text-slate-900 leading-snug">{item.name}</h1>
            <button
              onClick={() => toggleFavorite(item.id)}
              aria-label={t('Sevimlilar')}
              className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition ${fav ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:text-rose-500'}`}
            >
              <Heart className={`w-[18px] h-[18px] ${fav ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={share}
              aria-label={t('Ulashish')}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shrink-0 transition"
            >
              {shared ? <Check className="w-[18px] h-[18px] text-emerald-600" /> : <Share2 className="w-[18px] h-[18px]" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {item.reviews_count ? (
              <span className="flex items-center gap-1.5">
                <Stars value={item.rating || 0} size={15} />
                <span className="font-semibold text-slate-900">{item.rating}</span>
              </span>
            ) : null}
            {item.reviews_count ? <span className="text-slate-300">|</span> : null}
            {item.sold_count ? <span className="text-slate-500">{item.sold_count} {t('marta sotilgan')}</span> : null}
            {item.description && <span className="text-slate-500">{item.description}</span>}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">{money(item.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-slate-400 line-through">{money(item.old_price!)}</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">−{discount}%</span>
              </>
            )}
          </div>

          {item.specs?.length ? (
            <div className="space-y-2">
              <div className="font-bold text-slate-900">{t('Xususiyatlari')}</div>
              <dl className="space-y-1.5">
                {item.specs.map((a) => (
                  <div key={a.name} className="flex items-baseline gap-2 text-sm">
                    <dt className="text-slate-500 whitespace-nowrap">{a.name}</dt>
                    <span className="flex-1 border-b border-dotted border-slate-200 translate-y-[-3px]" />
                    <dd className="text-slate-900 font-medium text-right whitespace-nowrap">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {item.sizes?.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-slate-900">{t('Razmer')}</div>
              <div className="flex gap-2 flex-wrap">
                {item.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[58px] px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                      size === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-900">{t('Soni')}</span>
            <QtyInput value={qty} onChange={setQty} />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={cart}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
            >
              {added ? <><Check className="w-4 h-4" /> {t("Savatga qo'shildi")}</> : <><ShoppingCart className="w-4 h-4" /> {t("Savatga qo'shish")}</>}
            </button>
            <button
              onClick={() => setBuyOpen((o) => !o)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 font-bold text-sm hover:bg-slate-50 transition"
            >
              <Zap className="w-4 h-4" /> {t('Hozir sotib olish')}
            </button>
          </div>

          {buyOpen && !done && (
            <form onSubmit={buy} className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <PayPicker value={pay} onChange={setPay} />
              <AddressPicker value={form} onChange={setForm} />
              {err && <div className="text-sm text-rose-600">{err}</div>}
              <button disabled={busy} className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm disabled:opacity-60">
                {busy ? '...' : `${money(Number(item.price) * qty)} — ${user ? t('Buyurtma berish') : t('Kirish va sotib olish')}`}
              </button>
            </form>
          )}

          {done && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <Check className="w-6 h-6 text-emerald-600" />
              <div className="text-sm text-slate-900">
                {done.number} · {money(done.total)}
                <button type="button" onClick={() => navigate(`/orders/${done.id}`)} className="underline text-primary-600 ml-2">{t("Buyurtmani ko'rish")}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Reviews readyProductId={item.id} />

      {/* Rasmni to'liq ekranda ko'rish */}
      {zoom && images[photo] && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
        >
          <button onClick={() => setZoom(false)} aria-label={t('Yopish')} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={t('Oldingi')} className="absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={t('Keyingi')} className="absolute right-4 sm:right-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={images[photo].src}
            alt={item.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-2xl bg-white"
          />
          {images.length > 1 && (
            <div className="absolute bottom-5 text-white/80 text-sm">{photo + 1} / {images.length}</div>
          )}
        </div>
      )}
    </div>
  );
};
