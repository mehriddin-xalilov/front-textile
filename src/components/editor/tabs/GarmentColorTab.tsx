import React from 'react';
import { Palette, Check, Shirt } from 'lucide-react';
import { useShopStore } from '../../../store/shopStore';
import { useEditorStore } from '../../../store/editorStore';
import { PRESET_COLORS } from '../../../types/shirt';
import { ColorField } from '../ColorField';

/** Mahsulot va rang — API dan (product_colors). Rang = mockup rangi, variantlar (razmer) shu rangga bog'liq. */
export const GarmentColorTab: React.FC = () => {
  const products = useShopStore((s) => s.products);
  const product = useShopStore((s) => s.product);
  const productColor = useShopStore((s) => s.productColor);
  const selectProduct = useShopStore((s) => s.selectProduct);
  const selectColor = useShopStore((s) => s.selectColor);
  const colors = useEditorStore((s) => s.colors);
  const setColor = useEditorStore((s) => s.setColor);
  const [activeCategory, setActiveCategory] = React.useState<'all' | 'neutrals' | 'vibrant' | 'earth' | 'pastel'>('all');
  const filteredPresets = activeCategory === 'all' ? PRESET_COLORS : PRESET_COLORS.filter((c) => c.category === activeCategory);
  const currentColor = colors.body;

  if (!product) return null;

  const isLight = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160;
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Shirt className="w-3.5 h-3.5 text-primary-400" /> Mahsulot
        </label>
        <select
          value={product.slug}
          onChange={(e) => selectProduct(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500"
        >
          {products.map((p) => (
            <option key={p.id} value={p.slug}>{p.name} — {Number(p.base_price).toLocaleString()} UZS</option>
          ))}
        </select>
        {product.description && <p className="text-xs text-slate-500">{product.description}</p>}
        <p className="text-xs text-slate-500">Logo/yozuv bosish: +{Number(product.print_price).toLocaleString()} UZS</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-primary-400" /> Rang
        </label>
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {product.colors.map((pc) => {
            const isSelected = productColor?.id === pc.id;
            const stock = pc.variants.reduce((s, v) => s + v.available, 0);
            return (
              <button
                key={pc.id}
                onClick={() => selectColor(pc)}
                title={`${pc.color.name}${stock ? '' : ' (omborda yo\'q)'}`}
                className={`group relative aspect-square rounded-xl transition-all duration-200 shadow-md flex items-center justify-center border ${
                  isSelected ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-white scale-105 border-white' : 'border-slate-200 hover:scale-105 hover:border-slate-300'
                } ${stock ? '' : 'opacity-40'}`}
                style={{ backgroundColor: pc.color.hex }}
              >
                {isSelected && <Check className={`w-4 h-4 drop-shadow ${isLight(pc.color.hex) ? 'text-black' : 'text-white'}`} />}
              </button>
            );
          })}
        </div>
        {productColor && (
          <div className="text-xs text-slate-500">
            {productColor.color.name} · razmerlar:{' '}
            {productColor.variants.map((v) => (
              <span key={v.id} className={`inline-block mr-1 px-1.5 py-0.5 rounded ${v.available > 0 ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-300 line-through'}`}>{v.size.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Asl palitra: ko'rish uchun (buyurtma faqat mahsulot ranglarida) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-accent-400" /> Erkin rang (ko'rish uchun)
          </label>
          <ColorField value={currentColor} onChange={(hex) => setColor('all', hex)} />
        </div>
        {/* Category filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {['all', 'neutrals', 'vibrant', 'earth', 'pastel'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition text-xs font-medium ${
                activeCategory === cat
                  ? 'bg-primary-600/30 text-primary-300 border border-primary-500/40'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preset Palette Grid */}
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {filteredPresets.map((preset) => {
            const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.name}
                onClick={() => setColor('all', preset.hex)}
                title={`${preset.name} (${preset.hex})`}
                className={`group relative aspect-square rounded-xl transition-all duration-200 shadow-md flex items-center justify-center border ${
                  isSelected
                    ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-white scale-105 border-white'
                    : 'border-slate-200 hover:scale-105 hover:border-slate-300'
                }`}
                style={{ backgroundColor: preset.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 drop-shadow ${
                      [
                        '#ffffff',
                        '#f3e8dc',
                        '#d1d5db',
                        '#ccfbf1',
                        '#fef3c7',
                        '#fce7f3',
                        '#e9d5ff',
                        '#d4b996',
                      ].includes(preset.hex.toLowerCase())
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
