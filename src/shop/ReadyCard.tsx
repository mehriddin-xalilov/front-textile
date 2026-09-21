import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { ReadyProduct } from '../services/api';
import { t } from '../i18n';
import { useCartStore } from '../store/cartStore';

export const money = (v: string | number) => Number(v).toLocaleString('uz-UZ') + " so'm";

/** Tayyor mahsulot kartochkasi: admin yuklagan foto, nom, narx. Konstruktorga aloqasi yo'q. */
export const ReadyCard: React.FC<{ item: ReadyProduct }> = ({ item }) => {
  const favorites = useCartStore((s) => s.favorites);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const add = useCartStore((s) => s.add);
  const fav = favorites.includes(item.id);
  const count = item.images?.length || (item.image ? 1 : 0);
  const second = item.images?.[1]?.src;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      readyProductId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      size: item.sizes?.[0] || '—',
      qty: 1,
    });
  };

  return (
  <Link
    to={`/ready/${item.slug}`}
    className="group relative block rounded-2xl overflow-hidden bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 transition duration-200"
  >
    <button
      type="button"
      aria-label="Sevimlilar"
      onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }}
      className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-slate-200 flex items-center justify-center transition hover:scale-110 ${
        fav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
      }`}
    >
      <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500' : ''}`} />
    </button>
    <button
      type="button"
      aria-label="Savatga"
      onClick={addToCart}
      className="absolute bottom-[88px] right-2 z-10 w-9 h-9 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-primary-700"
    >
      <ShoppingCart className="w-4 h-4" />
    </button>
    <div className="relative aspect-square bg-gradient-to-b from-white to-[#F2F3F5] flex items-center justify-center overflow-hidden">
      {item.image ? (
        <>
          <img
            src={item.image}
            alt={item.name}
            className={`w-full h-full object-contain p-2 transition duration-300 group-hover:scale-[1.04] ${second ? 'group-hover:opacity-0' : ''}`}
          />
          {/* Ikkinchi rasm bo'lsa — ustiga kelganda ko'rsatamiz */}
          {second && (
            <img src={second} alt="" className="absolute inset-0 w-full h-full object-contain p-2 opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition duration-300" />
          )}
          {count > 1 && (
            <span className="absolute left-2 bottom-2 px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-600">
              {count} {t('rasm')}
            </span>
          )}
        </>
      ) : (
        <span className="text-slate-300 text-xs">rasm yo'q</span>
      )}
    </div>
    <div className="p-3 space-y-0.5">
      <div className="text-[13px] font-semibold text-slate-900 truncate">{item.name}</div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {item.reviews_count ? (
          <>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-700">{item.rating}</span>
            <span>({item.reviews_count})</span>
          </>
        ) : (
          <span className="truncate">{item.description || ''}</span>
        )}
      </div>
      <div className="pt-1 flex items-baseline gap-2">
        <span className="text-[15px] font-black text-slate-900">{money(item.price)}</span>
        {item.old_price && <span className="text-xs text-slate-400 line-through">{money(item.old_price)}</span>}
      </div>
    </div>
  </Link>
  );
};
