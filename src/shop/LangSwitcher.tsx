import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useShopStore } from '../store/shopStore';
import { Lang, t } from '../i18n';

/** Kichik bayroqchalar (SVG — emoji emas, hamma tizimda bir xil ko'rinadi). */
const Flag: React.FC<{ code: Lang; className?: string }> = ({ code, className = 'w-5 h-3.5' }) => {
  const common = `${className} rounded-[3px] shrink-0 ring-1 ring-black/10 object-cover`;
  if (code === 'uz') {
    return (
      <svg viewBox="0 0 30 21" className={common} aria-hidden>
        <rect width="30" height="6.6" fill="#1EB53A" y="14.4" />
        <rect width="30" height="7.8" fill="#fff" y="6.6" />
        <rect width="30" height="6.6" fill="#0099B5" />
        <rect width="30" height="0.9" fill="#CE1126" y="6.3" />
        <rect width="30" height="0.9" fill="#CE1126" y="13.8" />
        <circle cx="6.5" cy="3.3" r="2.2" fill="#fff" />
        <circle cx="7.6" cy="3.3" r="2.2" fill="#0099B5" />
      </svg>
    );
  }
  if (code === 'ru') {
    return (
      <svg viewBox="0 0 30 21" className={common} aria-hidden>
        <rect width="30" height="7" fill="#fff" />
        <rect width="30" height="7" y="7" fill="#0039A6" />
        <rect width="30" height="7" y="14" fill="#D52B1E" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 30 21" className={common} aria-hidden>
      <rect width="30" height="21" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} width="30" height="1.6" y={i * 1.615} fill="#B22234" />)}
      <rect width="13" height="11.3" fill="#3C3B6E" />
    </svg>
  );
};

const SHORT: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN' };
const NAME: Record<Lang, string> = { uz: "O'zbekcha", ru: 'Русский', en: 'English' };

/** Til tanlash: bayroq + kod, bosilganda ro'yxat ochiladi (marketplace uslubi). */
export const LangSwitcher: React.FC = () => {
  const lang = useShopStore((s) => s.lang) as Lang;
  const setLang = useShopStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-10 pl-2.5 pr-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:border-slate-300 transition"
      >
        <Flag code={lang} />
        <span>{SHORT[lang]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white border border-slate-200 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.3)] z-40"
        >
          <div className="px-2.5 pt-1.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('Til')}</div>
          {(Object.keys(NAME) as Lang[]).map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={lang === code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={`w-full px-2.5 py-2.5 rounded-xl flex items-center gap-3 text-sm transition ${
                lang === code ? 'text-slate-900 font-semibold bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flag code={code} className="w-5 h-3.5" />
              <span className="flex-1 text-left">{NAME[code]}</span>
              {lang === code && <Check className="w-4 h-4 text-primary-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
