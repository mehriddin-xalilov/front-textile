import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api, ReadyProduct } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { ReadyCard } from '../ReadyCard';
import { AccountLayout } from '../AccountLayout';
import { t } from '../../i18n';

/** Sevimlilar: yurakcha bosilgan tayyor mahsulotlar. */
export const FavoritesPage: React.FC = () => {
  const favorites = useCartStore((s) => s.favorites);
  const [items, setItems] = useState<ReadyProduct[] | null>(null);

  useEffect(() => { api.readyProducts().then(setItems).catch(() => setItems([])); }, []);

  if (!items) return <div className="text-slate-400 text-sm">{t('Yuklanmoqda...')}</div>;
  const list = items.filter((i) => favorites.includes(i.id));

  return (
    <AccountLayout title={t('Sevimlilar')}>
      {list.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {list.map((i) => <ReadyCard key={i.id} item={i} />)}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="text-slate-600">{t("Sevimlilar ro'yxati bo'sh")}</div>
          <Link to="/ready" className="inline-block px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">{t('Tayyor mahsulotlar')}</Link>
        </div>
      )}
    </AccountLayout>
  );
};
