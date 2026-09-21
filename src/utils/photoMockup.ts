import { DesignLayer } from '../types/editor';
import { renderLayersToCanvas } from './canvasRenderer';

/**
 * Tayyor mahsulot kartochkasi uchun do'kon rasmi.
 *
 * 3D render emas: kiyim **tekis (flat)** ko'rinishda, oq fonda chiziladi va ustiga bosma tushadi —
 * O'zbekiston merch do'konlaridagi mahsulot rasmlari shu uslubda.
 *
 * Kiyim shakli: `public/mockups/<plate>-flat.svg`. SVG ichidagi `__BODY__` rang bilan almashtiriladi,
 * shuning uchun bitta shakl barcha ranglarga yaraydi.
 */

const PLATES = '/mockups';

/** Plastinka: SVG viewBox ichidagi kiyim chegarasi va bosma joyi. */
type Plate = {
  view: { w: number; h: number };
  garment: { x: number; y: number; w: number; h: number };
  print: { x: number; y: number; w: number; h: number };
};

const PLATE_INFO: Record<string, Plate> = {
  tshirt: {
    view: { w: 1000, h: 1120 },
    garment: { x: 142, y: 112, w: 716, h: 940 },
    print: { x: 250, y: 300, w: 500, h: 360 },
  },
};

/** Kartochka nisbati 4:5. */
const RATIO = 0.8;
/** Kiyim balandligi kadrning necha qismini egallaydi. */
const FILL = 0.92;

const svgCache = new Map<string, string>();
const imgCache = new Map<string, HTMLImageElement>();

async function garmentImage(plate: string, color: string): Promise<HTMLImageElement> {
  const key = `${plate}:${color}`;
  const hit = imgCache.get(key);
  if (hit) return hit;

  let svg = svgCache.get(plate);
  if (!svg) {
    const res = await fetch(`${PLATES}/${plate}-flat.svg`);
    if (!res.ok) throw new Error(`maket shakli topilmadi: ${plate}`);
    svg = await res.text();
    svgCache.set(plate, svg);
  }
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/__BODY__/g, color || '#ffffff'))}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('maket shakli yuklanmadi'));
    el.src = url;
  });
  imgCache.set(key, img);

  return img;
}

const make = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d')! };
};

/** Chizilgan qatlamlarning haqiqiy chegarasi (shaffof bo'lmagan piksellar). */
function contentBox(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { x: 0, y: 0, w, h };
  const pad = 4;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);

  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export type PhotoMockupOptions = {
  /** Kiyim rangi (hex). */
  color: string;
  /** Dizayn qatlamlari (editor koordinatalari: 0..1). */
  layers: DesignLayer[];
  /** Chiqish balandligi (eni 4:5 nisbatda). */
  size?: number;
  /** Kiyim shakli: `public/mockups/<plate>-flat.svg`. */
  plate?: string;
};

/** Do'kon rasmini PNG blob sifatida qaytaradi. */
export async function renderPhotoMockup({ color, layers, size = 1100, plate = 'tshirt' }: PhotoMockupOptions): Promise<Blob> {
  const info = PLATE_INFO[plate] || PLATE_INFO.tshirt;
  const garment = await garmentImage(plate, color);
  const H = size, W = Math.round(size * RATIO);

  // SVG ni kadrga moslash: kiyim balandligi FILL ga teng bo'lsin
  const k = (FILL * H) / info.garment.h;
  const dw = info.view.w * k, dh = info.view.h * k;
  const ox = (W - info.garment.w * k) / 2 - info.garment.x * k;
  const oy = (H - info.garment.h * k) / 2 - info.garment.y * k;
  const rect = (r: { x: number; y: number; w: number; h: number }) =>
    ({ x: ox + r.x * k, y: oy + r.y * k, w: r.w * k, h: r.h * k });

  const out = make(W, H);
  out.ctx.fillStyle = '#ffffff';
  out.ctx.fillRect(0, 0, W, H);
  out.ctx.drawImage(garment, ox, oy, dw, dh);

  // Bosma: editor kvadratida chiziladi, keyin bosma maydoniga "contain" qilib joylanadi
  if (layers?.length) {
    const art = make(1000, 1000);
    await renderLayersToCanvas(art.ctx, layers, 1000, 1000);
    const box = contentBox(art.ctx, 1000, 1000);

    const a = rect(info.print);
    const s = Math.min(a.w / box.w, a.h / box.h);
    const rw = box.w * s, rh = box.h * s;
    out.ctx.drawImage(art.c, box.x, box.y, box.w, box.h, a.x + (a.w - rw) / 2, a.y + (a.h - rh) / 2, rw, rh);
  }

  return new Promise<Blob>((resolve, reject) =>
    out.c.toBlob((b) => (b ? resolve(b) : reject(new Error('mockup blob yaratilmadi'))), 'image/png')
  );
}
