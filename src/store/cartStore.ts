import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLine = {
  readyProductId: number;
  slug: string;
  name: string;
  image?: string | null;
  price: string;
  size: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  favorites: number[];
  add: (line: CartLine) => void;
  setQty: (readyProductId: number, size: string, qty: number) => void;
  remove: (readyProductId: number, size: string) => void;
  clear: () => void;
  toggleFavorite: (readyProductId: number) => void;
  isFavorite: (readyProductId: number) => boolean;
  count: () => number;
  total: () => number;
};

/** Savat va sevimlilar — brauzerda saqlanadi (kirmagan foydalanuvchi ham to'plashi mumkin). */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      favorites: [],

      add: (line) =>
        set((s) => {
          const i = s.lines.findIndex((l) => l.readyProductId === line.readyProductId && l.size === line.size);
          if (i === -1) return { lines: [...s.lines, line] };
          const lines = [...s.lines];
          lines[i] = { ...lines[i], qty: Math.min(99, lines[i].qty + line.qty) };

          return { lines };
        }),

      setQty: (id, size, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.readyProductId === id && l.size === size ? { ...l, qty } : l)) })),

      remove: (id, size) =>
        set((s) => ({ lines: s.lines.filter((l) => !(l.readyProductId === id && l.size === size)) })),

      clear: () => set({ lines: [] }),

      toggleFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),

      isFavorite: (id) => get().favorites.includes(id),

      count: () => get().lines.reduce((n, l) => n + l.qty, 0),

      total: () => get().lines.reduce((n, l) => n + Number(l.price) * l.qty, 0),
    }),
    { name: 'tx_cart' }
  )
);
