import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Truck, Palette, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, Category, Product, ReadyProduct } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { t } from '../../i18n';
import { ReadyCard, money } from '../ReadyCard';

/** Bosh sahifa: banner + tayyor mahsulotlar + 3D konstruktor katalogi. */
export const HomePage: React.FC = () => {
  const products = useShopStore((s) => s.products);
  const site = useShopStore((s) => s.site);
  const [slide, setSlide] = useState(0);
  const banners = site?.banners || [];
  const banner = banners[slide % Math.max(1, banners.length)];
  useEffect(() => {
    if (banners.length > 1) {
      const i = setInterval(() => setSlide((x) => x + 1), 6000);
      return () => clearInterval(i);
    }
  }, [banners.length]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<number | null>(null);
  const [ready, setReady] = useState<ReadyProduct[]>([]);
  const [params] = useSearchParams();
  const type = params.get('type');

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
    api.readyProducts().then(setReady).catch(() => {});
  }, []);

  // Banner rasmi bo'lmasa — tayyor mahsulot fotolaridan kollaj
  const heroShots = ready.map((r) => r.image).filter(Boolean).slice(0, 3) as string[];

  const list = products.filter(
    (p) => (!category || (p as any).category_id === category) && (!type || (p as any).type === type)
  );

  return (
    <div className="space-y-12">
      {/* Banner: katta rasm + qisqa matn (3D konstruktor sahifasi alohida) */}
      <section className="relative group rounded-3xl overflow-hidden bg-white border border-slate-200 grid md:grid-cols-2 min-h-[340px] sm:min-h-[420px]">
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setSlide((x) => x - 1 + banners.length)}
              aria-label={t('Oldingi')}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-105 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSlide((x) => x + 1)}
              aria-label={t('Keyingi')}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-105 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center gap-5">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight">
            {banner?.title || 'Motex'}
          </h1>
          {banner?.subtitle && <p className="text-slate-600 text-base max-w-md leading-relaxed">{banner.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to={banner?.link && !banner.link.startsWith('http') ? banner.link : '/ready'}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition"
            >
              {banner?.button_text || t('Tayyor mahsulotlar')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-bold text-sm transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> {t('Konstruktor')}
            </Link>
          </div>
          {banners.length > 1 && (
            <div className="flex gap-1.5 pt-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === slide % banners.length ? 'w-6 bg-primary-600' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rasm: admin yuklagan banner, bo'lmasa tayyor mahsulot fotolari */}
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-200 overflow-hidden">
          {banner?.image?.src ? (
            <img src={banner.image.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : heroShots.length ? (
            <div className="absolute inset-0 grid grid-cols-2 gap-2 p-4">
              {heroShots.map((src, i) => (
                <div key={i} className={`rounded-2xl bg-white overflow-hidden ${i === 0 ? 'row-span-2' : ''}`}>
                  <img src={src} alt="" className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Afzalliklar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Palette, title: t('Bir donadan buyurtma'), text: t('Minimal miqdor yo\'q') },
          { icon: Truck, title: t('Yetkazib berish'), text: t("O'zbekiston bo'ylab 2-3 kunda") },
          { icon: ShieldCheck, title: t('Sifat kafolati'), text: t("100% paxta, bosma yuvishda o'chmaydi") },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-slate-900 text-sm">{f.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{f.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Tayyor mahsulotlar */}
      {ready.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="templates" className="text-2xl font-black text-slate-900 tracking-tight">{t('Tayyor mahsulotlar')}</h2>
              <p className="text-slate-500 text-sm">{t('Tanlang va darhol buyurtma bering — dizayn tayyor.')}</p>
            </div>
            <Link to="/ready" className="text-sm font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap">
              {t('Barchasi')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ready.slice(0, 10).map((x) => <ReadyCard key={x.id} item={x} />)}
          </div>
        </section>
      )}

      {/* 3D katalog */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Kiyimlar')}</h2>
          <p className="text-slate-500 text-sm">{t("3D konstruktorda o'z dizayningizni yarating")}</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory(null)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition ${category === null ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {t('Barchasi')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition ${category === c.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          {!list.length && <div className="text-slate-400 text-sm">{t("Mahsulot yo'q")}</div>}
        </div>
      </section>
    </div>
  );
};

/** 3D katalog kartochkasi: bosilsa to'g'ridan-to'g'ri konstruktor ochiladi. */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const img = (product as any).garment_model?.thumbnail?.src;
  return (
    <Link
      to={`/studio?product=${product.slug}`}
      className="group rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 overflow-hidden transition duration-200"
    >
      <div className="aspect-square bg-gradient-to-b from-white to-[#F2F3F5] flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-[1.04] transition duration-300" />
        ) : (
          <span className="text-slate-300 text-xs">rasm yo'q</span>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <div className="text-[13px] font-semibold text-slate-900 truncate">{product.name}</div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-black text-slate-900">{money(product.base_price)}</span>
          <span className="flex gap-1">
            {product.colors?.slice(0, 5).map((c) => (
              <span key={c.id} className="w-3 h-3 rounded-full border border-slate-200" style={{ background: c.color.hex }} />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
};
