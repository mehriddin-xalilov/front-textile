import React, { useEffect, useMemo, useState } from 'react';
import { api, ReadyProduct } from '../../services/api';
import { ReadyCard } from '../ReadyCard';
import { t } from '../../i18n';

/** Tayyor mahsulotlar — admin panelda kiritilgan, darhol sotib olinadigan mahsulotlar. */
export const ReadyPage: React.FC = () => {
  const [items, setItems] = useState<ReadyProduct[] | null>(null);
  const [group, setGroup] = useState<string>('');

  useEffect(() => { api.readyProducts().then(setItems).catch(() => setItems([])); }, []);

  const groups = useMemo(() => [...new Set((items || []).map((i) => i.description || '').filter(Boolean))], [items]);

  // Skelet: kartochkalar kelguncha joy band bo'lib turadi
  if (!items) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-9 w-64 rounded-xl bg-slate-100" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="aspect-square bg-slate-100" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const list = group ? items.filter((i) => (i.description || '') === group) : items;
  const chip = 'px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition ';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Tayyor mahsulotlar')}</h1>
        <p className="text-slate-500 text-sm">{t('Tanlang va darhol buyurtma bering — dizayn tayyor.')}</p>
      </div>
      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setGroup('')} className={chip + (!group ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>{t('Barchasi')}</button>
          {groups.map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={chip + (group === g ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>{g}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {list.map((i) => <ReadyCard key={i.id} item={i} />)}
        {!list.length && <div className="text-slate-400 text-sm">{t("Mahsulot yo'q")}</div>}
      </div>
    </div>
  );
};
