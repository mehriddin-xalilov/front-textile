import React, { useEffect, useRef, useState } from 'react';
import { StudioScene } from '../components/3d/StudioScene';
import { useThree } from '@react-three/fiber';
import { useShopStore } from '../store/shopStore';
import { useEditorStore } from '../store/editorStore';
import { useSceneStore } from '../store/sceneStore';
import { api, getToken } from '../services/api';
import { capture3DMockup } from '../utils/imageExporter';
import { renderPhotoMockup } from '../utils/photoMockup';

const API_ROOT = (import.meta.env.VITE_API_ROOT as string) || 'http://127.0.0.1:8200/api/v1';
const SIZE = 900; // render o'lchami (kvadrat kartochka uchun)
/** Qaysi mahsulot uchun haqiqiy foto plastinkasi bor (public/mockups). */
const PHOTO_PLATES: Record<string, string> = { 'classic-tshirt': 'tshirt' };

/**
 * /tools/thumbs — admin uchun: har mahsulot 3D modelidan rasm (thumbnail) va har tayyor dizayndan preview
 * avtomatik olinadi va serverga yuklanadi. Admin sifatida kirilgan bo'lishi kerak (tx_token).
 */
/** Sahifa ko'rinmasa rAF to'xtaydi — suratdan oldin qo'lda render qilish uchun ko'prik. */
const RenderBridge: React.FC<{ onReady: (fn: () => void) => void }> = ({ onReady }) => {
  const { gl, scene, camera } = useThree();
  useEffect(() => { onReady(() => gl.render(scene, camera)); }, [gl, scene, camera, onReady]);
  return null;
};

export const ThumbsTool: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderNow = useRef<() => void>(() => {});
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const products = useShopStore((s) => s.products);
  const push = (m: string) => setLog((l) => [...l, m]);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Sahna canvas'i. Panel yashirilsa R3F uni 300x150 ga tushirib yuboradi — bunday rasm saqlanmaydi. */
  const snapshot = async () => {
    for (let i = 0; i < 10; i++) {
      const canvas = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-engine]')]
        .sort((a, b) => b.width * b.height - a.width * a.height)[0] || canvasRef.current!;
      if (canvas && canvas.width >= SIZE / 2) {
        renderNow.current();  // oxirgi holatni majburan chizamiz (panel yashirin bo'lsa ham)
        return (await capture3DMockup(canvas, { target: '3d_mockup', format: 'png', resolution: '2x', background: 'transparent', includeMeasurements: false, fileName: 'thumb' })) as Blob;
      }
      await sleep(1000);
    }
    throw new Error("canvas o'lchami kichik (sahifa ko'rinmayapti?)");
  };
  const adminPut = (path: string, body: unknown) =>
    fetch(`${API_ROOT}/admin${path}`, { method: 'PUT', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) }).then((r) => r.json());

  const run = async () => {
    setRunning(true);
    // Studiya yorug'ligi + old ko'rinish: marketplace kartochkasi uchun
    useSceneStore.getState().setLightingPreset('studio_clean');
    useSceneStore.getState().setCameraPreset('front');
    useEditorStore.getState().loadProject({ version: '2', timestamp: 0, title: '', colors: useEditorStore.getState().colors, layers: [] });
    for (const p of products) {
      try {
        await useShopStore.getState().selectProduct(p.slug);
        await sleep(3500);
        const file = await api.upload(await snapshot(), `${p.slug}-thumb.png`);
        const gm = (useShopStore.getState().product as any)?.garment_model;
        if (gm?.id) { await adminPut(`/garment-models/${gm.id}`, { thumbnail_id: file.id }); push(`✓ ${p.name} → thumbnail #${file.id}`); }
        else push(`– ${p.name}: 3D model yo'q`);
      } catch (e: any) { push(`✗ ${p.name}: ${e.message}`); }
    }
    // Tayyor dizaynlar preview
    try {
      const templates = await api.templates();
      for (const t of templates) {
        const full = await api.template(t.id);
        await useShopStore.getState().selectProduct(full.product.slug);
        const pc = useShopStore.getState().product?.colors.find((c) => c.id === full.product_color.id);
        if (pc) useShopStore.getState().selectColor(pc);
        const c = full.canvas || {};
        useEditorStore.getState().loadProject({ version: '2', timestamp: 0, title: '', colors: c.colors, layers: c.layers || [] });
        if (c.colors?.body) useEditorStore.getState().setColor('all', c.colors.body);
        await sleep(4000);
        const file = await api.upload(await snapshot(), `template-${t.id}.png`);
        // Do'kon fotosi: 3D render emas, studiya fotosi ustiga bosilgan maket (plastinka bor mahsulotlarda)
        let photoId = file.id;
        const plate = PHOTO_PLATES[full.product.slug];
        if (plate) {
          try {
            const blob = await renderPhotoMockup({ plate, color: c.colors?.body || pc?.color.hex || '#ffffff', layers: c.layers || [] });
            photoId = (await api.upload(blob, `template-${t.id}-photo.png`)).id;
          } catch (e: any) { push(`  ⚠︎ foto maket: ${e.message}`); }
        }
        await adminPut(`/designs/${t.id}`, { canvas: full.canvas, product_color_id: full.product_color.id, preview_file_id: file.id, photo_file_id: photoId, name: full.name });
        push(`✓ shablon ${t.template_title || t.id} → #${file.id}`);
      }
    } catch (e: any) { push(`✗ shablonlar: ${e.message}`); }
    setRunning(false);
    push('Tayyor.');
  };

  /** Faqat do'kon fotolarini qayta yaratish (3D render qilmay — tez). */
  const runPhotos = async () => {
    setRunning(true);
    try {
      const templates = await api.templates();
      for (const t of templates) {
        try {
          const full = await api.template(t.id);
          const plate = PHOTO_PLATES[full.product.slug];
          if (!plate) { push(`– ${full.name}: foto plastinkasi yo'q (3D render qoladi)`); continue; }
          const c = full.canvas || {};
          const blob = await renderPhotoMockup({ plate, color: c.colors?.body || full.product_color?.color?.hex || '#ffffff', layers: c.layers || [] });
          const file = await api.upload(blob, `template-${t.id}-photo.png`);
          await adminPut(`/designs/${t.id}`, { canvas: full.canvas, product_color_id: full.product_color.id, photo_file_id: file.id, name: full.name });
          push(`✓ foto ${full.name} → #${file.id}`);
        } catch (e: any) { push(`✗ ${t.id}: ${e.message}`); }
      }
    } catch (e: any) { push(`✗ shablonlar: ${e.message}`); }
    setRunning(false);
    push('Fotolar tayyor.');
  };

  useEffect(() => { if (products.length && !running && !log.length && new URLSearchParams(location.search).get('auto')) (new URLSearchParams(location.search).get('only') === 'photos' ? runPhotos() : run()); /* eslint-disable-line */ }, [products.length]);

  return (
    <div className="h-screen w-screen bg-surface-950 flex">
      {/* Qat'iy o'lcham: sahifa ko'rinmasa ham render o'lchami saqlanadi */}
      <div style={{ width: SIZE, height: SIZE, flex: '0 0 auto' }}>
        <StudioScene canvasRef={canvasRef}>
          <RenderBridge onReady={(fn) => { renderNow.current = fn; }} />
        </StudioScene>
      </div>
      <div className="flex-1 p-4 text-xs text-surface-300 space-y-2 overflow-auto">
        <div className="flex gap-2">
          <button disabled={running || !products.length} onClick={run} className="px-3 py-2 rounded-lg bg-primary-600 text-white font-bold disabled:opacity-50">Rasmlarni yaratish</button>
          <button disabled={running} onClick={runPhotos} className="px-3 py-2 rounded-lg bg-surface-800 text-white font-bold disabled:opacity-50">Faqat do'kon fotolari</button>
        </div>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};
