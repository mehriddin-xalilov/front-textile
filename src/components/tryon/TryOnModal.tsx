import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, SwitchCamera } from 'lucide-react';
import { t } from '../../i18n';
import { useEditorStore } from '../../store/editorStore';
import { renderPhotoMockup } from '../../utils/photoMockup';

/** Futbolka rasmidagi (photoMockup plastinkasi) kiyim chegarasi — 1000×1120 viewBox ichida. */
const GARMENT = { x: 142, y: 112, w: 716, h: 940, view: { w: 1000, h: 1120 } };
/** Elka kengligiga nisbatan kiyim kengligi (yenglar bilan). */
const WIDTH_K = 1.62;

type Pt = { x: number; y: number; visibility?: number };

const ema = (prev: number | undefined, cur: number, a = 0.35) => (prev === undefined ? cur : prev + (cur - prev) * a);

/**
 * Kamerada kiyib ko'rish: tanlangan rang va dizayndagi futbolka kamera tasviridagi odamning ustiga tushadi.
 * Hammasi brauzerda ishlaydi (MediaPipe Pose) — video serverga yuborilmaydi.
 */
export const TryOnModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [found, setFound] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [aspect, setAspect] = useState(4 / 3);
  const colors = useEditorStore((s) => s.colors);
  const layers = useEditorStore((s) => s.layers);

  useEffect(() => {
    let stop = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    let landmarker: any = null;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error(t('Brauzer kamerani qo\'llamaydi (HTTPS kerak).'));
        // 1) kiyim rasmi: tanlangan rang + dizayn (front)
        const blob = await renderPhotoMockup({ color: colors.body, layers: layers.filter((l) => (l as any).zone === 'front' && l.visible !== false), size: 1100 });
        const img = await createImageBitmap(blob);

        // 2) kamera
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setAspect(video.videoWidth / video.videoHeight || 4 / 3);

        // 3) pose modeli (dinamik import — asosiy bundle kattalashmaydi)
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
        const fileset = await FilesetResolver.forVisionTasks('/mediapipe');
        const make = (delegate: 'GPU' | 'CPU') => PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: '/mediapipe/pose_landmarker_lite.task', delegate },
          runningMode: 'VIDEO', numPoses: 1,
        });
        try { landmarker = await make('GPU'); } catch { landmarker = await make('CPU'); }
        if (stop) return;
        setStatus('ready');

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const sm: Record<string, number> = {};
        let last = -1;

        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (video.readyState < 2) return;
          if (canvas.width !== video.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (video.currentTime === last) return;
          last = video.currentTime;

          const res = landmarker.detectForVideo(video, performance.now());
          const lm: Pt[] | undefined = res.landmarks?.[0];
          const W = canvas.width, H = canvas.height;
          if (!lm || (lm[11].visibility ?? 1) < 0.5 || (lm[12].visibility ?? 1) < 0.5) { setFound(false); return; }
          setFound(true);

          // kamera ko'zgu kabi (selfie) ko'rsatiladi — chap/o'ng almashadi, shuning uchun 12 → chap elka ekranda
          const ls = { x: lm[12].x * W, y: lm[12].y * H }; // ekranda chapda
          const rs = { x: lm[11].x * W, y: lm[11].y * H };
          const cx = ema(sm.cx, (ls.x + rs.x) / 2), cy = ema(sm.cy, (ls.y + rs.y) / 2);
          const dist = ema(sm.d, Math.hypot(rs.x - ls.x, rs.y - ls.y));
          const ang = ema(sm.a, Math.atan2(rs.y - ls.y, rs.x - ls.x));
          Object.assign(sm, { cx, cy, d: dist, a: ang });

          const gw = dist * WIDTH_K;
          // balandlik: son (hip) ko'rinsa elka→son masofasidan (kiyim aniq bo'yga tushadi), bo'lmasa nisbatdan
          let gh = gw * (GARMENT.h / GARMENT.w);
          if ((lm[23].visibility ?? 0) > 0.5 && (lm[24].visibility ?? 0) > 0.5) {
            const hx = ((lm[23].x + lm[24].x) / 2) * W, hy = ((lm[23].y + lm[24].y) / 2) * H;
            const torso = Math.hypot(hx - cx, hy - cy);
            gh = ema(sm.h, Math.min(Math.max(torso * 1.32, gw * 0.9), gw * 1.7));
            sm.h = gh;
          }
          // plastinka tasviri 1100px balandlikda; garment bbox shu tasvirdagi o'rni
          const k = (0.92 * 1100) / GARMENT.h; // photoMockup ichidagi masshtab
          const ow = (0.8 * 1100 - GARMENT.w * k) / 2 - GARMENT.x * k; // dx
          const oy = (1100 - GARMENT.h * k) / 2 - GARMENT.y * k;
          const sx = ow + GARMENT.x * k, sy = oy + GARMENT.y * k, sw = GARMENT.w * k, sh = GARMENT.h * k;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ang);
          // yoqa yuqori markazi elka chizig'idan biroz tepada
          ctx.drawImage(img, sx, sy, sw, sh, -gw / 2, -dist * 0.12, gw, gh);
          ctx.restore();
        };
        loop();
      } catch (e: any) {
        setError(e?.name === 'NotAllowedError' ? t('Kameraga ruxsat berilmadi. Brauzer sozlamalaridan ruxsat bering.') : (e?.message || String(e)));
        setStatus('error');
      }
    })();

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
      landmarker?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  // fon scroll qilinmasin
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  const mirror = facing === 'user';
  return (
    <div className="fixed inset-0 z-50 bg-black sm:bg-slate-900/90 sm:backdrop-blur-sm flex items-center justify-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="relative bg-black sm:rounded-3xl overflow-hidden sm:shadow-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-3xl"
        style={{ aspectRatio: undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-20 flex gap-2" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <button onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))} aria-label={t('Kamerani almashtirish')} className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center"><SwitchCamera className="w-5 h-5" /></button>
          <button onClick={onClose} aria-label={t('Yopish')} className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        {/* video + kiyim: telefon (vertikal) da butun ekran, kompyuterda kamera nisbatida */}
        <div className="relative w-full h-full sm:h-auto bg-slate-900 sm:max-h-[92dvh]" style={{ transform: mirror ? 'scaleX(-1)' : undefined }}>
          <div className="hidden sm:block" style={{ aspectRatio: String(aspect) }} />
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pt-10 bg-gradient-to-t from-black/85 to-transparent text-white text-sm flex items-center gap-2" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {status === 'loading' && <><RefreshCw className="w-4 h-4 animate-spin shrink-0" /> {t('Kamera va model yuklanmoqda...')}</>}
          {status === 'ready' && (found ? <><Camera className="w-4 h-4 text-emerald-400 shrink-0" /> {t('Futbolka kiyildi — harakatlanib ko\'ring')}</> : <><Camera className="w-4 h-4 text-amber-300 shrink-0" /> {t('Elkalaringiz va ko\'kragingiz kadrda ko\'rinsin: kameradan 1-2 metr uzoqlashing')}</>)}
          {status === 'error' && <span className="text-rose-300">{error}</span>}
        </div>
      </div>
    </div>
  );
};
