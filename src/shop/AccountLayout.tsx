import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { t } from '../i18n';

/** Shaxsiy kabinet karkasi: chapda menyu, o'ngda kontent (Uzum uslubi). */
export const AccountLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const user = useShopStore((s) => s.user);
  const logout = useShopStore((s) => s.logout);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const navigate = useNavigate();

  const item = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <UserRound className="w-12 h-12 text-slate-300 mx-auto" />
        <div className="text-slate-600">{t('Shaxsiy kabinet uchun tizimga kiring')}</div>
        <button onClick={() => setAuthOpen(true)} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">
          {t('Kirish')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
      <aside className="bg-white border border-slate-200 rounded-2xl p-3 lg:sticky lg:top-24">
        <div className="flex items-center gap-3 p-3 mb-2">
          <span className="w-11 h-11 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black">
            {(user.full_name || '?').slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">{user.full_name}</div>
            <div className="text-xs text-slate-500">{user.phone_number}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/orders" className={item}><Package className="w-[18px] h-[18px]" /> {t('Buyurtmalarim')}</NavLink>
          <NavLink to="/favorites" className={item}><Heart className="w-[18px] h-[18px]" /> {t('Sevimlilar')}</NavLink>
          <NavLink to="/addresses" className={item}><MapPin className="w-[18px] h-[18px]" /> {t('Manzillarim')}</NavLink>
          <NavLink to="/profile" end className={item}><UserRound className="w-[18px] h-[18px]" /> {t("Ma'lumotlarim")}</NavLink>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition text-left"
          >
            <LogOut className="w-[18px] h-[18px]" /> {t('Chiqish')}
          </button>
        </nav>
      </aside>

      <section className="space-y-5 min-w-0">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        {children}
      </section>
    </div>
  );
};
