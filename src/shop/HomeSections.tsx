import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shirt, Type, ShoppingBag, Truck, Users, Star, ChevronDown, ArrowRight, Sparkles, Image as ImageIcon, Layers, Send, MessageCircle,
} from 'lucide-react';
import { api, Product, Review, Site } from '../services/api';
import { t } from '../i18n';

/** Kategoriya plitkalari: mahsulot 3D-thumbnail bilan, bosilsa konstruktor. */
export const CategoryTiles: React.FC<{ products: Product[] }> = ({ products }) => {
  if (!products.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Nima bosamiz?')}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {products.slice(0, 6).map((p) => {
          const img = (p as any).garment_model?.thumbnail?.src;
          return (
            <Link key={p.id} to={`/studio?product=${p.slug}`} className="group rounded-2xl bg-white border border-slate-200 p-3 flex flex-col items-center gap-2 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition">
              <div className="w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                {img ? <img src={img} alt={p.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition" /> : <Shirt className="w-8 h-8 text-slate-300" />}
              </div>
              <div className="text-xs font-semibold text-slate-800 text-center leading-tight">{p.name}</div>
              <div className="text-[11px] text-slate-500">{Number(p.base_price).toLocaleString('uz-UZ')} {t("so'mdan")}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/** Qanday ishlaydi: 3 qadam. */
export const HowItWorks: React.FC = () => {
  const steps = [
    { icon: Shirt, title: t('Kiyimni tanlang'), text: t('Futbolka, polo, xudi, kepka — rang va razmer bilan') },
    { icon: Type, title: t("Dizayn qiling"), text: t("Logotip yuklang yoki yozuv yozing, 3D da aylantirib ko'ring") },
    { icon: ShoppingBag, title: t('Buyurtma bering'), text: t("Payme, Click yoki Uzum orqali to'lang") },
    { icon: Truck, title: t('Qabul qiling'), text: t("2-3 kunda O'zbekiston bo'ylab yetkazamiz") },
  ];
  return (
    <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Qanday ishlaydi?')}</h2>
          <p className="text-slate-500 text-sm">{t("Bir donadan boshlab, 5 daqiqada")}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <div key={s.title} className="relative flex gap-4">
            <div className="shrink-0">
              <span className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center"><s.icon className="w-6 h-6" /></span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-primary-600 tracking-wider">0{i + 1}</div>
              <div className="font-bold text-slate-900">{s.title}</div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{s.text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Konstruktor reklamasi: qorong'i blok, imkoniyatlar ro'yxati. */
export const StudioPromo: React.FC = () => {
  const feats = [
    { icon: ImageIcon, text: t("Logotip yoki rasm yuklash (PNG, SVG)") },
    { icon: Type, text: t("50+ shrift, egri yozuv, kontur") },
    { icon: Layers, text: t("Old, orqa va yenglarga alohida bosma") },
    { icon: Sparkles, text: t("Tayyor logolar va trend so'zlar") },
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white grid lg:grid-cols-2">
      <div className="p-8 sm:p-12 space-y-6 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold"><Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t('3D konstruktor')}</span>
        <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{t("Dizaynni o'zingiz yarating — natijani darhol 3D da ko'ring")}</h2>
        <ul className="space-y-3">
          {feats.map((f) => (
            <li key={f.text} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><f.icon className="w-4 h-4 text-primary-300" /></span>{f.text}
            </li>
          ))}
        </ul>
        <Link to="/studio" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition">
          {t('Dizayn qilishni boshlash')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="relative min-h-[280px] bg-gradient-to-br from-primary-600/30 via-slate-900 to-slate-900">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <iframe title="3D" src="/studio?embed=view&product=classic-tshirt" className="absolute inset-0 w-full h-full pointer-events-none" tabIndex={-1} loading="lazy" />
      </div>
    </section>
  );
};

/** Korporativ / jamoa buyurtmalari. */
export const CorporateBlock: React.FC<{ site: Site | null }> = ({ site }) => {
  const tg = site?.contact?.telegram || 'https://t.me/mehriddin_xalilov';
  const phone = site?.contact?.phone;
  return (
    <section className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary-100"><Users className="w-4 h-4" /> {t('Jamoa va korporativ buyurtmalar')}</div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t("Kompaniya, jamoa yoki tadbir uchun bir xil kiyim kerakmi?")}</h2>
        <p className="text-primary-100 text-sm max-w-xl">{t("10 donadan boshlab chegirma, dizaynda bepul yordam, bir rangdagi mato va bosma. Narxni 1 soatda hisoblab beramiz.")}</p>
      </div>
      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
        <a href={tg} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-bold text-sm hover:bg-primary-50 transition"><Send className="w-4 h-4" /> Telegram</a>
        {phone && <a href={`tel:${phone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 text-white font-bold text-sm hover:bg-white/25 transition"><MessageCircle className="w-4 h-4" /> {phone}</a>}
      </div>
    </section>
  );
};

/** Mijozlar fikri: tasdiqlangan sharhlar (API). Sharh bo'lmasa ko'rsatilmaydi. */
export const Testimonials: React.FC = () => {
  const [items, setItems] = useState<Review[]>([]);
  useEffect(() => { api.reviews({}).then((r) => setItems(r.filter((x) => x.comment && x.rating >= 4).slice(0, 6))).catch(() => {}); }, []);
  if (!items.length) return null;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Mijozlar fikri')}</h2>
        <p className="text-slate-500 text-sm">{t('Haqiqiy buyurtmalardan')}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div>
            <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{r.comment}</p>
            <div className="text-xs font-semibold text-slate-500">{r.author || t('Mijoz')}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Ko'p beriladigan savollar. */
export const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  const qa = [
    [t('Minimal buyurtma miqdori qancha?'), t("Minimal miqdor yo'q — bir dona ham buyurtma qilsa bo'ladi. 10 donadan boshlab chegirma beriladi.")],
    [t('Bosma yuvishda o\'chib ketmaydimi?'), t("Yo'q. DTF va sublimatsiya bosma ishlatamiz — 40°C da yuvish va dazmollashga chidaydi, kafolat beramiz.")],
    [t('Qancha vaqtda tayyor bo\'ladi?'), t("Bir dona — 1-2 kun, jamoa buyurtmasi — 3-5 kun. Yetkazib berish O'zbekiston bo'ylab 2-3 kun.")],
    [t("Logotipim sifatsiz bo'lsa-chi?"), t("Dizaynerimiz bepul tozalab beradi. SVG yoki 1000px dan katta PNG yuborsangiz eng yaxshi natija bo'ladi.")],
    [t("Qanday to'lash mumkin?"), t("Payme, Click va Uzum orqali onlayn. Korporativ buyurtmalar uchun hisob-faktura (perechisleniye).")],
  ];
  return (
    <section className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("Ko'p beriladigan savollar")}</h2>
        <p className="text-slate-500 text-sm mt-1">{t("Javob topolmadingizmi? Telegramda yozing — 10 daqiqada javob beramiz.")}</p>
      </div>
      <div className="space-y-2">
        {qa.map(([q, a], i) => (
          <div key={q} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-semibold text-slate-900 text-sm">{q}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};
