import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useShopStore } from '../../store/shopStore';
import { t } from '../../i18n';

/** "+998 90 123 45 67" ko'rinishi. Faqat raqamlar saqlanadi. */
const digitsOf = (v: string) => v.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
const formatPhone = (digits: string) => {
  const p = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);

  return p.length ? `+998 ${p[0]}${p[1] ? ' ' + p[1] : ''}${p[2] ? ' ' + p[2] : ''}${p[3] ? ' ' + p[3] : ''}` : '+998 ';
};

type Step = 'phone' | 'password' | 'register';

/**
 * Kirish va ro'yxatdan o'tish (Uzum uslubi): avval telefon raqam so'raladi,
 * keyin raqam bazada bor-yo'qligiga qarab parol yoki ro'yxatdan o'tish oynasi chiqadi.
 */
export const AuthModal: React.FC = () => {
  const isOpen = useShopStore((s) => s.isAuthOpen);
  const setOpen = useShopStore((s) => s.setAuthOpen);
  const setUser = useShopStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('phone');
  const [digits, setDigits] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  const phone = `+998${digits}`;
  const ready = digits.length === 9;

  useEffect(() => {
    if (!isOpen) return;
    setStep('phone'); setDigits(''); setName(''); setPassword(''); setError(''); setShowPass(false);
  }, [isOpen]);

  useEffect(() => {
    const id = setTimeout(() => firstField.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);

    return () => { clearTimeout(id); document.removeEventListener('keydown', onKey); };
  }, [step, isOpen, setOpen]);

  if (!isOpen) return null;

  const fail = (err: unknown) => {
    const ae = err as ApiError;
    setError(Object.values(ae.errors || {}).flat()[0] || ae.message || t('Xatolik'));
  };

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true); setError('');
    try {
      const { exists } = await api.checkPhone(phone);
      setStep(exists ? 'password' : 'register');
    } catch (err) { fail(err); } finally { setBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = step === 'password' ? await api.login(phone, password) : await api.register(name, phone, password);
      setUser(user);
      setOpen(false);
    } catch (err) { fail(err); } finally { setBusy(false); }
  };

  const field = 'w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] text-slate-900 outline-none transition focus:bg-white focus:border-slate-900 placeholder:text-slate-400';
  const primary = 'w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-[15px] font-bold transition disabled:opacity-40 disabled:hover:bg-primary-600 flex items-center justify-center gap-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] bg-white rounded-3xl p-7 sm:p-8 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between mb-6">
          {step === 'phone' ? <span /> : (
            <button type="button" onClick={() => { setStep('phone'); setError(''); }} aria-label={t('Orqaga')} className="w-9 h-9 -ml-1 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label={t('Yopish')} className="w-9 h-9 -mr-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'phone' && (
          <form onSubmit={next} className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('Kirish yoki ro\'yxatdan o\'tish')}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{t('Telefon raqamingizni kiriting — keyingi qadamni o\'zimiz tanlaymiz.')}</p>
            </div>
            <input
              ref={firstField}
              inputMode="tel"
              autoComplete="tel"
              className={`${field} tracking-wide font-semibold`}
              value={formatPhone(digits)}
              onChange={(e) => setDigits(digitsOf(e.target.value))}
              placeholder="+998 90 123 45 67"
            />
            {error && <div className="text-sm text-rose-600">{error}</div>}
            <button disabled={!ready || busy} className={primary}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Davom etish')}
            </button>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              {t('Davom etish orqali siz ommaviy oferta shartlariga rozilik bildirasiz.')}
            </p>
          </form>
        )}

        {step !== 'phone' && (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {step === 'password' ? t('Parolni kiriting') : t('Ro\'yxatdan o\'tish')}
              </h2>
              <p className="text-sm text-slate-500">
                {formatPhone(digits)}
                <button type="button" onClick={() => setStep('phone')} className="ml-2 text-primary-600 font-semibold hover:underline">
                  {t('O\'zgartirish')}
                </button>
              </p>
            </div>

            {step === 'register' && (
              <input ref={firstField} className={field} placeholder={t('Ismingiz')} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" />
            )}

            <div className="relative">
              <input
                ref={step === 'password' ? firstField : undefined}
                className={`${field} pr-12`}
                type={showPass ? 'text' : 'password'}
                placeholder={step === 'password' ? t('Parol') : t('Parol o\'ylab toping')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={step === 'password' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={t('Parolni ko\'rsatish')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                {showPass ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>

            {step === 'register' && <p className="text-xs text-slate-400">{t('Kamida 6 ta belgi')}</p>}
            {error && <div className="text-sm text-rose-600">{error}</div>}

            <button disabled={busy || password.length < 6} className={primary}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 'password' ? t('Kirish') : t('Ro\'yxatdan o\'tish')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
