import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, Product, ProductColor } from '../../services/api';
import { t } from '../../i18n';
import { Reviews } from '../Reviews';

const money = (v: string | number) => Number(v).toLocaleString('uz-UZ') + " so'm";
/** Mahsulot: 3D ko'rinish, ranglar, razmer qoldiqlari, "Dizayn qilish" → /studio. */
export const ProductPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [color, setColor] = useState<ProductColor | null>(null);

  useEffect(() => {
    api.product(slug).then((p) => { setProduct(p); setColor(p.colors[0] || null); }).catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <div className="text-slate-500 text-sm">{t('Yuklanmoqda...')}</div>;
  const price = Number(color?.price ?? product.base_price);

  return (
    <div className="space-y-12">
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="aspect-square rounded-3xl bg-gradient-to-b from-white to-slate-100 border border-slate-200 overflow-hidden">
          <iframe title="3D" src={`/studio?embed=view&product=${product.slug}`} className="w-full h-full" />
        </div>
        <div className="text-xs text-slate-500">{t('Sichqoncha bilan aylantiring')}</div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-xs text-slate-500">{(product as any).category?.name}</div>
          <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
          <div className="text-2xl font-bold text-primary-600 mt-2">{money(price)}</div>
          <div className="text-xs text-slate-500">{t('+ logo/yozuv bosish')} {money(product.print_price)}</div>
        </div>
        {product.description && <p className="text-slate-600 text-sm">{product.description}</p>}
        {(product as any).fabric && <div className="text-sm text-slate-600"><span className="text-slate-400">{t('Mato')}:</span> {(product as any).fabric}</div>}

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">{t('Rang')}</div>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button key={c.id} onClick={() => setColor(c)} title={c.color.name} className={`w-9 h-9 rounded-xl border-2 ${color?.id === c.id ? 'border-primary-400 scale-110' : 'border-slate-200'}`} style={{ background: c.color.hex }} />
            ))}
          </div>
          <div className="text-xs text-slate-500">{color?.color.name}</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">{t('Razmerlar (omborda)')}</div>
          <div className="flex gap-2 flex-wrap">
            {color?.variants.map((v) => (
              <span key={v.id} className={`px-3 py-1.5 rounded-xl text-sm border ${v.available > 0 ? 'border-slate-200 text-slate-900' : 'border-slate-200 text-slate-400 line-through'}`}>{v.size.name}</span>
            ))}
          </div>
        </div>

        <Link to={`/studio?product=${product.slug}`} className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-600/30">{t('Dizayn qilish va buyurtma berish')}</Link>
      </div>
    </div>

      <Reviews productId={product.id} />
    </div>
  );
};
