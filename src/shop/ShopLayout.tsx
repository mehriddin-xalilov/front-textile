import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { UserRound, Package, LogIn, Sparkles, Heart, ShoppingCart } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { AuthModal } from '../components/shop/AuthModal';
import { t } from '../i18n';
import { LangSwitcher } from './LangSwitcher';
import { useCartStore } from '../store/cartStore';
import { ScrollToTop } from './ScrollToTop';

/**
 * Mijoz sayti karkasi: header + kontent + footer.
 * Do'kon qismi yorug' (marketplace uslubi), konstruktor (/studio) esa o'z qorong'i temasida qoladi.
 */
export const ShopLayout: React.FC = () => {
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const error = useShopStore((s) => s.error);
  const site = useShopStore((s) => s.site);
  const lang = useShopStore((s) => s.lang);
  const setLang = useShopStore((s) => s.setLang);
  const c = site?.contact || {};
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const favCount = useCartStore((s) => s.favorites.length);

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`;

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 flex flex-col select-text">
      <ScrollToTop />
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Motex">
            <img src="/brand/mark.svg" alt="" className="w-9 h-9" />
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-black tracking-tight text-slate-900 uppercase">Motex</div>
              <div className="text-[10px] text-slate-500">{t("O'z logotipingizni bosing")}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 ml-2">
            <NavLink to="/ready" className={link}>{t('Tayyor mahsulotlar')}</NavLink>
            <NavLink to="/" end className={link}>{t('Katalog')}</NavLink>
            {user && <NavLink to="/orders" className={link}><span className="inline-flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{t('Buyurtmalarim')}</span></NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/studio" className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t('Konstruktor')}
            </Link>

            <Link to="/favorites" aria-label={t('Sevimlilar')} className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-500 hover:border-slate-300 flex items-center justify-center transition">
              <Heart className="w-[18px] h-[18px]" />
              {favCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{favCount}</span>}
            </Link>

            <Link to="/cart" aria-label={t('Savat')} className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-primary-600 hover:border-slate-300 flex items-center justify-center transition">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
            </Link>
            <LangSwitcher />
            {user ? (
              <Link to="/profile" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200">
                <UserRound className="w-3.5 h-3.5 text-primary-600" /> <span className="hidden sm:inline">{user.full_name}</span>
              </Link>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition">
                <LogIn className="w-3.5 h-3.5" /> {t('Kirish')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-7">
        {error ? <div className="text-rose-600 text-sm">{error}</div> : <Outlet />}
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid sm:grid-cols-4 gap-8 text-sm">
          <div className="space-y-2">
            <img src="/brand/logo-white.svg" alt="Motex" className="h-8 w-auto" />
            <p className="text-slate-400 text-xs leading-relaxed">{t("O'z logotipingizni bosing")}</p>
          </div>
          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">{t('Katalog')}</div>
            <Link to="/ready" className="block text-slate-400 hover:text-white">{t('Tayyor mahsulotlar')}</Link>
            <Link to="/?type=blank" className="block text-slate-400 hover:text-white">{t('Logosiz kiyimlar')}</Link>
            <Link to="/studio" className="block text-slate-400 hover:text-white">{t('3D konstruktor')}</Link>
          </div>
          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">{t('Sahifalar')}</div>
            {site?.pages.map((p) => <Link key={p.slug} to={`/page/${p.slug}`} className="block text-slate-400 hover:text-white">{p.title}</Link>)}
            <Link to="/orders" className="block text-slate-400 hover:text-white">{t('Buyurtmalarim')}</Link>
          </div>
          <div className="space-y-1.5">
            <div className="text-white font-semibold mb-2">{t('Aloqa')}</div>
            {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="block text-slate-400 hover:text-white">{c.phone}</a>}
            {c.telegram && <a href={c.telegram} className="block text-slate-400 hover:text-white">Telegram</a>}
            {c.instagram && <a href={c.instagram} className="block text-slate-400 hover:text-white">Instagram</a>}
            {c.email && <a href={`mailto:${c.email}`} className="block text-slate-400 hover:text-white">{c.email}</a>}
            {(c[`address_${lang}`] || c.address_uz) && <span className="block text-slate-400">{c[`address_${lang}`] || c.address_uz}</span>}
            {c.work_hours && <span className="block text-slate-400">{c.work_hours}</span>}
            <div className="flex items-center gap-2 pt-3">
              <span className="h-7 px-2 rounded-md bg-white flex items-center"><img src="/pay/payme.png" alt="Payme" className="h-4 object-contain" /></span>
              <span className="h-7 px-2 rounded-md bg-white flex items-center"><img src="/pay/click-dark.svg" alt="Click" className="h-3.5 object-contain" /></span>
              <span className="h-7 px-2 rounded-md bg-white flex items-center"><img src="/pay/uzum.png" alt="Uzum" className="h-4 object-contain" /></span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 px-4 sm:px-8 text-[11px] text-slate-500 flex flex-wrap gap-4 justify-between max-w-7xl mx-auto">
          <span>© {new Date().getFullYear()} Motex. {t('Barcha huquqlar himoyalangan.')}</span>
          <span>3D: chokybali, ShoyoX, maxx_renn (Sketchfab, CC-BY) · jericNuez/shirt-designer (MIT)</span>
        </div>
      </footer>
      <AuthModal />
    </div>
  );
};
