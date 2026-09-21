import React from 'react';
import { Minus, Plus } from 'lucide-react';

/** Soni: − [n] + (marketplace uslubi, brauzer strelkalarisiz). */
export const QtyInput: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number }> = ({
  value, onChange, min = 1, max = 99,
}) => {
  const clamp = (v: number) => Math.min(max, Math.max(min, v || min));
  const btn = 'w-10 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition';

  return (
    <div className="h-11 inline-flex items-stretch rounded-xl border border-slate-200 bg-white overflow-hidden select-none">
      <button type="button" aria-label="−" className={btn} disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <Minus className="w-4 h-4" />
      </button>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, ''))))}
        className="w-12 bg-white text-center text-sm font-bold text-slate-900 outline-none border-x border-slate-200 [appearance:textfield]"
      />
      <button type="button" aria-label="+" className={btn} disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
