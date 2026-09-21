import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useShopStore } from '../../store/shopStore';

/** Kirish / ro'yxatdan o'tish — telefon + parol (Textile API). */
export const AuthModal: React.FC = () => {
  const isOpen = useShopStore((s) => s.isAuthOpen);
  const setOpen = useShopStore((s) => s.setAuthOpen);
  const setUser = useShopStore((s) => s.setUser);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = mode === 'login' ? await api.login(phone, password) : await api.register(name, phone, password);
      setUser(user);
      setOpen(false);
    } catch (err) {
      const ae = err as ApiError;
      setError(Object.values(ae.errors || {}).flat()[0] || ae.message);
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-primary-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
        </div>
        {mode === 'register' && <input className={input} placeholder="Ismingiz" value={name} onChange={(e) => setName(e.target.value)} required />}
        <input className={input} placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input className={input} type="password" placeholder="Parol" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <div className="text-xs text-rose-400">{error}</div>}
        <button disabled={busy} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold disabled:opacity-60">
          {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {busy ? '...' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-xs text-slate-500 hover:text-slate-900">
          {mode === 'login' ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : 'Hisobingiz bormi? Kiring'}
        </button>
      </form>
    </div>
  );
};
