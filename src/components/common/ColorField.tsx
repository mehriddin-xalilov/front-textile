import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Check, Pipette } from 'lucide-react';

/** Bosma uchun qulay tayyor ranglar (oq/qora, asosiy va pastel). */
const SWATCHES = [
  '#000000', '#FFFFFF', '#6B7280', '#DC2626', '#EA580C', '#F59E0B', '#FACC15', '#84CC16',
  '#16A34A', '#0D9488', '#0EA5E9', '#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#F43F5E',
  '#FCA5A5', '#FDBA74', '#FDE68A', '#BBF7D0', '#A5F3FC', '#BFDBFE', '#DDD6FE', '#FBCFE8',
];

const RECENT_KEY = 'tx_recent_colors';
const readRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };

type Props = {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  /** Swatch tugmasi yonida hex matnini ko'rsatish */
  showHex?: boolean;
  className?: string;
};

/**
 * Rang tanlash maydoni: brauzerning oddiy `<input type="color">` o'rniga
 * zamonaviy popover — tayyor ranglar, oxirgi ishlatilganlar, spektr va hex kiritish.
 */
export const ColorField: React.FC<Props> = ({ value, onChange, label, showHex = true, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const [recent, setRecent] = useState<string[]>(readRecent);
  const ref = useRef<HTMLDivElement>(null);
  const color = (value || '#000000').toUpperCase();

  useEffect(() => setHex(color), [color]);

  // Tashqariga bosilsa / Esc — yopiladi va tanlangan rang "oxirgilar"ga yoziladi
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
        const next = [color, ...recent.filter((c) => c !== color)].slice(0, 8);
        setRecent(next);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* xotira yopiq */ }
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open, color, recent]);

  const commitHex = (v: string) => {
    const s = v.trim().replace(/^#?/, '#');
    setHex(s.toUpperCase());
    if (/^#[0-9a-f]{6}$/i.test(s)) onChange(s.toUpperCase());
  };

  const pickFromScreen = async () => {
    const EyeDropper = (window as any).EyeDropper;
    if (!EyeDropper) return;
    try { const r = await new EyeDropper().open(); onChange(r.sRGBHex.toUpperCase()); } catch { /* bekor qilindi */ }
  };

  const Swatch = ({ c }: { c: string }) => (
    <button
      type="button"
      title={c}
      onClick={() => onChange(c)}
      className="relative w-6 h-6 rounded-md border border-black/10 hover:scale-110 transition shadow-sm"
      style={{ background: c }}
    >
      {c === color && <Check className={`absolute inset-0 m-auto w-3.5 h-3.5 ${isDark(c) ? 'text-white' : 'text-slate-900'}`} />}
    </button>
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="block text-xs text-slate-500 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition"
      >
        <span className="w-6 h-6 rounded-md border border-black/10 shadow-inner" style={{ background: color }} />
        {showHex && <span className="text-[11px] font-mono text-slate-600">{color}</span>}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[248px] p-3 rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] space-y-3 tx-color-popover">
          <HexColorPicker color={color} onChange={(c) => onChange(c.toUpperCase())} style={{ width: '100%', height: 150 }} />

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg border border-black/10 shrink-0" style={{ background: color }} />
            <div className="flex-1 flex items-center h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 font-mono text-xs text-slate-700 focus-within:border-primary-400 focus-within:bg-white">
              <input
                value={hex}
                onChange={(e) => commitHex(e.target.value)}
                onBlur={() => setHex(color)}
                maxLength={7}
                spellCheck={false}
                className="w-full bg-transparent outline-none uppercase"
              />
            </div>
            {(window as any).EyeDropper && (
              <button type="button" onClick={pickFromScreen} title="Ekrandan olish" className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600">
                <Pipette className="w-4 h-4" />
              </button>
            )}
          </div>

          {recent.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Oxirgilar</div>
              <div className="flex flex-wrap gap-1.5">{recent.map((c) => <Swatch key={c} c={c} />)}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tayyor ranglar</div>
            <div className="grid grid-cols-8 gap-1.5">{SWATCHES.map((c) => <Swatch key={c} c={c} />)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
};
