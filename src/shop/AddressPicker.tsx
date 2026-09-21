import React, { useEffect, useState } from 'react';
import { Check, MapPin, Plus } from 'lucide-react';
import { api, Address } from '../services/api';
import { useShopStore } from '../store/shopStore';
import { t } from '../i18n';

export type Delivery = { name: string; phone: string; address: string };

/**
 * Checkout uchun manzil: saqlangan manzillardan tanlash yoki yangisini kiritish.
 * Tanlangan manzil `onChange` orqali buyurtma maydonlariga beriladi.
 */
export const AddressPicker: React.FC<{ value: Delivery; onChange: (v: Delivery) => void }> = ({ value, onChange }) => {
  const user = useShopStore((s) => s.user);
  const [items, setItems] = useState<Address[] | null>(null);
  const [selected, setSelected] = useState<number | 'new'>('new');
  const input = 'w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';

  useEffect(() => {
    if (!user) return setItems([]);
    api.addresses().then((list) => {
      setItems(list);
      const def = list.find((a) => a.is_default) || list[0];
      if (def) {
        setSelected(def.id);
        onChange({ name: def.recipient_name, phone: def.recipient_phone, address: def.full });
      }
    }).catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const pick = (a: Address) => {
    setSelected(a.id);
    onChange({ name: a.recipient_name, phone: a.recipient_phone, address: a.full });
  };

  return (
    <div className="space-y-2">
      {items && items.length > 0 && (
        <>
          <div className="text-xs font-semibold text-slate-500 uppercase">{t('Manzilni tanlang')}</div>
          <div className="space-y-2">
            {items.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => pick(a)}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition ${
                  selected === a.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{a.label || t('Manzil')}</span>
                  <span className="block text-xs text-slate-500 break-words">{a.full}</span>
                </span>
                {selected === a.id && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setSelected('new'); onChange({ name: '', phone: '', address: '' }); }}
              className={`w-full p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                selected === 'new' ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-dashed border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              <Plus className="w-4 h-4" /> {t('Yangi manzil kiritish')}
            </button>
          </div>
        </>
      )}

      {(selected === 'new' || !items?.length) && (
        <div className="space-y-2 pt-1">
          <input className={input} placeholder={t('Ismingiz')} value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          <input className={input} placeholder={t('Telefon (+998...)')} value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
          <input className={input} placeholder={t('Yetkazib berish manzili')} value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} required />
        </div>
      )}
    </div>
  );
};
