import { create } from 'zustand';
import { api, Clipart, Font, Phrase, Product, ProductColor, Site, User, getToken, setToken } from '../services/api';
import { Lang, getLang, setLang } from '../i18n';
import { useEditorStore } from './editorStore';

/**
 * Do'kon holati: mahsulot (API), tanlangan rang/variant, foydalanuvchi, lug'atlar.
 * Kiyim rangi = product_color.color.hex → editorStore.colors.body.
 */
interface ShopState {
  loading: boolean;
  error: string | null;
  products: Product[];
  product: Product | null;
  productColor: ProductColor | null;
  variantId: number | null;
  quantity: number;
  user: User | null;
  fonts: Font[];
  cliparts: Clipart[];
  phrases: Phrase[];
  isAuthOpen: boolean;
  isOrderOpen: boolean;
  site: Site | null;
  lang: Lang;
  editingDesignId: number | null;   // admin: mijoz dizaynini tahrirlash rejimi
  setLang: (l: Lang) => void;
  setEditingDesignId: (id: number | null) => void;

  bootstrap: (slug?: string) => Promise<void>;
  selectProduct: (slug: string) => Promise<void>;
  selectColor: (pc: ProductColor) => void;
  setVariantId: (id: number | null) => void;
  setQuantity: (q: number) => void;
  setUser: (u: User | null) => void;
  setAuthOpen: (v: boolean) => void;
  setOrderOpen: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  loading: true,
  error: null,
  products: [],
  product: null,
  productColor: null,
  variantId: null,
  quantity: 1,
  user: null,
  fonts: [],
  cliparts: [],
  phrases: [],
  isAuthOpen: false,
  isOrderOpen: false,
  site: null,
  lang: getLang(),
  editingDesignId: null,
  // Til almashish: sahifa qayta yuklanmaydi (3D model va shriftlar qayta yuklanmasin) —
  // faqat til belgilanadi va kontent yangi tilda qayta olinadi.
  setLang: (l) => {
    setLang(l);
    set({ lang: l });
    void (async () => {
      try {
        const [products, site] = await Promise.all([api.products(), api.site().catch(() => null)]);
        set({ products, site: site ?? get().site });
      } catch { /* til baribir almashdi */ }
    })();
  },
  setEditingDesignId: (editingDesignId) => set({ editingDesignId }),

  bootstrap: async (slug) => {
    try {
      const [fonts, cliparts, phrases, products, site] = await Promise.all([api.fonts(), api.cliparts(), api.phrases(), api.products(), api.site().catch(() => null)]);
      set({ fonts, cliparts, phrases, products, site });
      loadGoogleFonts(fonts.map((f) => f.family));
      await get().selectProduct(slug || products[0]?.slug);
      if (getToken()) {
        try {
          set({ user: await api.me() });
        } catch {
          setToken(null);
        }
      }
      set({ loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message || 'API bilan bog\'lanib bo\'lmadi' });
    }
  },

  selectProduct: async (slug) => {
    if (!slug) return;
    const product = await api.product(slug);
    set({ product });
    const first = product.colors[0];
    if (first) get().selectColor(first);
  },

  selectColor: (pc) => {
    set({ productColor: pc, variantId: pc.variants.find((v) => v.available > 0)?.id ?? null });
    useEditorStore.getState().setColor('all', pc.color.hex);
  },

  setVariantId: (variantId) => set({ variantId }),
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  setUser: (user) => set({ user }),
  setAuthOpen: (isAuthOpen) => set({ isAuthOpen }),
  setOrderOpen: (isOrderOpen) => set({ isOrderOpen }),
  logout: async () => {
    await api.logout().catch(() => {});
    set({ user: null });
  },
}));

/** Google Fonts'ni dinamik yuklash (config/fonts.php ro'yxati). */
function loadGoogleFonts(families: string[]) {
  if (!families.length || document.getElementById('tx-fonts')) return;
  const link = document.createElement('link');
  link.id = 'tx-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?' +
    families.map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,700;0,900;1,400;1,700`).join('&') +
    '&display=swap';
  document.head.appendChild(link);
  families.forEach((f) => document.fonts.load(`16px "${f}"`).catch(() => {}));
}
