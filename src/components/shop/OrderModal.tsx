import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';
import { useEditorStore } from '../../store/editorStore';
import { api, ApiError, dataUrlToBlob } from '../../services/api';
import { capture3DMockup, generatePrintArtwork } from '../../utils/imageExporter';
import { DesignZone } from '../../types/shirt';
import { DesignLayer } from '../../types/editor';

interface Props { canvas3DRef: React.RefObject<HTMLCanvasElement>; }

import { PayPicker, PayMethod } from '../../shop/PayPicker';
import { QtyInput } from '../../shop/QtyInput';

const ZONES: DesignZone[] = ['front', 'back', 'sleeve_left', 'sleeve_right'];
const ZONE_LABEL: Record<DesignZone, string> = { front: 'Old', back: 'Orqa', sleeve_left: 'Chap yeng', sleeve_right: "O'ng yeng" };

/**
 * Saqlash va buyurtma:
 *  1) 3D snapshot → /files (preview)
 *  2) har tomon uchun 300 DPI PNG → /files (print_files)
 *  3) data:URL rasmlar → /files (file_id)
 *  4) POST /designs {canvas: {version:2, engine:'shirt-designer-3d', ...}}
 *  5) POST /orders {variant, quantity, design_id, manzil}
 */
export const OrderModal: React.FC<Props> = ({ canvas3DRef }) => {
  const isOpen = useShopStore((s) => s.isOrderOpen);
  const setOpen = useShopStore((s) => s.setOrderOpen);
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const product = useShopStore((s) => s.product);
  const productColor = useShopStore((s) => s.productColor);
  const variantId = useShopStore((s) => s.variantId);
  const setVariantId = useShopStore((s) => s.setVariantId);
  const quantity = useShopStore((s) => s.quantity);
  const setQuantity = useShopStore((s) => s.setQuantity);
  const layers = useEditorStore((s) => s.layers);
  const colors = useEditorStore((s) => s.colors);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ number: string; total: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('payme');
  const [payUrl, setPayUrl] = useState<string | null>(null);

  if (!isOpen || !product || !productColor) return null;

  const zonesWithLayers = ZONES.filter((z) => layers.some((l) => l.zone === z && l.visible));
  const unit = Number(productColor.price ?? product.base_price) + (zonesWithLayers.length ? Number(product.print_price) : 0);
  const total = unit * quantity;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setAuthOpen(true);
    if (!variantId) return setError('Razmer tanlang');
    setBusy(true);
    setError('');
    try {
      const opts = { target: '3d_mockup', format: 'png', resolution: '2x', background: 'transparent', includeMeasurements: false, fileName: 'preview' } as const;

      setStep('3D ko\'rinish saqlanmoqda...');
      const canvas = (document.querySelector('canvas[data-engine]') as HTMLCanvasElement) || canvas3DRef.current;
      const preview = await api.upload((await capture3DMockup(canvas, opts)) as Blob, 'preview.png');

      setStep('Bosma fayllar tayyorlanmoqda (300 DPI)...');
      const printFiles: Record<string, number> = {};
      for (const zone of zonesWithLayers) {
        const blob = (await generatePrintArtwork(layers, colors, zone, { ...opts, target: 'print_template', resolution: 'print_300dpi' })) as Blob;
        printFiles[zone] = (await api.upload(blob, `print-${zone}.png`)).id;
      }

      setStep('Rasmlar yuklanmoqda...');
      const savedLayers: DesignLayer[] = [];
      for (const l of layers) {
        if (l.type === 'image' && l.src.startsWith('data:')) {
          const f = await api.upload(await dataUrlToBlob(l.src), `${l.name || 'image'}.png`);
          savedLayers.push({ ...l, src: f.src, fileId: f.id } as any);
        } else savedLayers.push(l);
      }

      setStep('Dizayn saqlanmoqda...');
      const design = await api.createDesign({
        product_id: product.id,
        product_color_id: productColor.id,
        name: (layers.find((l) => l.type === 'text') as any)?.text?.slice(0, 60) || product.name,
        preview_file_id: preview.id,
        print_file_id: printFiles[zonesWithLayers[0]] ?? null,
        canvas: { version: 2, engine: 'shirt-designer-3d', colors, layers: savedLayers, print_files: printFiles },
      });

      setStep('Buyurtma yaratilmoqda...');
      const order = await api.createOrder({
        items: [{ product_variant_id: variantId, quantity, design_id: design.id }],
        recipient_name: name || user.full_name,
        recipient_phone: phone || user.phone_number,
        delivery_address: address,
        note: note || undefined,
        payment_method: payMethod,
      });
      setDone(order);
      // To'lov majburiy: buyurtma yaratilgach darhol to'lov sahifasiga o'tadi
      setStep("To'lov sahifasiga o'tilmoqda...");
      const url = await api.payUrl(order.id, payMethod);
      setPayUrl(url);
      window.location.href = url;
    } catch (err) {
      const ae = err as ApiError;
      setError(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
      setStep('');
    }
  };

  const input = 'w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => !busy && setOpen(false)}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary-400" /> Buyurtma</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="text-center space-y-3 py-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-7 h-7 text-emerald-400" /></div>
            <div className="text-slate-900 font-bold text-lg">{done.number}</div>
            <div className="text-slate-600 text-sm">Buyurtma qabul qilindi. Jami: <b className="text-slate-900">{Number(done.total).toLocaleString()} UZS</b></div>
            {payUrl && <a href={payUrl} className="inline-block px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold">To'lovga o'tish</a>}
            <button type="button" onClick={() => { setOpen(false); setDone(null); }} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold">Yopish</button>
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-600">
              <b className="text-slate-900">{product.name}</b> · {productColor.color.name} · {zonesWithLayers.length ? `bosma: ${zonesWithLayers.map((z) => ZONE_LABEL[z]).join(', ')}` : 'bosmasiz'}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Razmer</label>
                <select className={input} value={variantId ?? ''} onChange={(e) => setVariantId(Number(e.target.value))}>
                  {productColor.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.available < 1}>{v.size.name} {v.available < 1 ? '(yo\'q)' : `(${v.available})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Soni</label>
                <div className="mt-1"><QtyInput value={quantity} onChange={setQuantity} /></div>
              </div>
            </div>

            <input className={input} placeholder="Qabul qiluvchi ismi" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={input} placeholder="Telefon (+998...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className={input} placeholder="Yetkazib berish manzili" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <input className={input} placeholder="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} />

            <div className="space-y-1.5">
              <div className="text-xs text-slate-500">To'lov usuli</div>
              <PayPicker value={payMethod} onChange={setPayMethod} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{unit.toLocaleString()} × {quantity}</span>
              <span className="text-slate-900 font-bold text-lg">{total.toLocaleString()} UZS</span>
            </div>

            {step && <div className="text-xs text-primary-600">{step}</div>}
            {error && <div className="text-xs text-rose-400">{error}</div>}

            {!user && <div className="text-xs text-amber-600">Buyurtma berish uchun avval kiring.</div>}
            <button disabled={busy} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold disabled:opacity-60">
              {busy ? 'Kuting...' : user ? 'Buyurtma berish' : 'Kirish va buyurtma berish'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};
