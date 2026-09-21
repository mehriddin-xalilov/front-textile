import React from 'react';

export type PayMethod = 'payme' | 'click' | 'uzum';

/** Naqd yo'q: buyurtma to'lovdan keyin rasmiylashadi. `h` — logotip balandligi. */
const METHODS: { id: PayMethod; label: string; img: string; h: string }[] = [
  { id: 'payme', label: 'Payme', img: '/pay/payme.png', h: 'max-h-7' },
  { id: 'click', label: 'Click', img: '/pay/click-dark.svg', h: 'max-h-5' },
  { id: 'uzum', label: 'Uzum', img: '/pay/uzum.png', h: 'max-h-6' },
];

/** To'lov usuli: faqat logotiplar (ostida yozuv yo'q), tanlangani ko'k ramka bilan. */
export const PayPicker: React.FC<{ value: PayMethod; onChange: (v: PayMethod) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-2">
    {METHODS.map((m) => (
      <button
        type="button"
        key={m.id}
        aria-label={m.label}
        aria-pressed={value === m.id}
        onClick={() => onChange(m.id)}
        className={`h-14 rounded-xl border-2 bg-white flex items-center justify-center px-2 transition ${
          value === m.id ? 'border-primary-600 ring-2 ring-primary-100' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <img src={m.img} alt={m.label} className={`${m.h} max-w-full object-contain`} />
      </button>
    ))}
  </div>
);
