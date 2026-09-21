import React, { useEffect, useRef, useState } from 'react';
import { Check, Pipette } from 'lucide-react';

const HEX = /^#([0-9a-f]{6})$/i;

/**
 * Zamonaviy rang tanlagich: hex maydon + tayyor ranglar.
 * Brauzerning eski OS oynasini (`input[type=color]`) ochmaydi — hammasi sahifa ichida.
 */
export const ColorField: React.FC<{ value: string; onChange: (hex: string) => void; swatches?: string[] }> = ({
  value,
  onChange,
  swatches = ['#FFFFFF', '#111827', '#374151', '#1B2A4A', '#DC2626', '#F97316', '#FBBF24', '#234E3E', '#0EA5E9', '#7C3AED', '#F3E8DC', '#D4B996'],
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const commit = (hex: string) => {
    setDraft(hex);
    if (HEX.test(hex)) onChange(hex);
  };

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
      >
        <span className="w-5 h-5 rounded-md border border-slate-200 shadow-inner" style={{ background: value }} />
        <span className="font-mono text-[11px] text-slate-600 uppercase">{value}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 p-3 rounded-2xl bg-white border border-slate-200 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.3)] z-40 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl border border-slate-200 shrink-0" style={{ background: HEX.test(draft) ? draft : value }} />
            <div className="flex-1 flex items-center gap-1.5 px-2 py-2 rounded-xl border border-slate-200">
              <Pipette className="w-3.5 h-3.5 text-slate-400" />
              <input
                value={draft}
                onChange={(e) => commit(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
                maxLength={7}
                spellCheck={false}
                className="w-full font-mono text-xs uppercase text-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => { onChange(hex); setDraft(hex); }}
                className="aspect-square rounded-lg border border-slate-200 flex items-center justify-center hover:scale-110 transition"
                style={{ background: hex }}
              >
                {value.toLowerCase() === hex.toLowerCase() && (
                  <Check className={`w-3.5 h-3.5 ${hex.toLowerCase() === '#ffffff' ? 'text-slate-900' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
