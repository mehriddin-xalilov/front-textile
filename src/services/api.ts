/**
 * Textile API mijozi. Base: VITE_API_ROOT (default http://127.0.0.1:8200/api/v1).
 * Token localStorage'da ("tx_token"). Javob formati: { data } | { message, errors }.
 */
const API_ROOT = (import.meta.env.VITE_API_ROOT as string) || 'http://127.0.0.1:8200/api/v1';
const TOKEN_KEY = 'tx_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors: Record<string, string[]> = {}) {
    super(message);
  }
}

async function request<T = any>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Accept-Language': localStorage.getItem('tx_lang') || 'uz', ...(init.headers as any) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = init.body;
  if (init.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(API_ROOT + path, { ...init, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || `HTTP ${res.status}`, res.status, data.errors || {});
  return data;
}

export type Font = { family: string; category: string; styles: string[] };
export type Clipart = { id: number; name: string; category: string; recolorable: boolean; src: string };
export type Phrase = { id: number; text: string; category: string; font_family: string; font_weight: string; font_style: 'normal' | 'italic'; fill: string };
export type Variant = { id: number; sku: string; available: number; size: { id: number; name: string } };
export type ProductColor = { id: number; price: string | null; color: { id: number; name: string; hex: string }; variants: Variant[] };
export type Product = { id: number; name: string; slug: string; base_price: string; print_price: string; description?: string; garment_model?: { id: number; name: string; url: string; zones?: Record<string, unknown> | null } | null; colors: ProductColor[]; print_areas: any[] };
export type User = { id: number; full_name: string; phone_number: string; first_name?: string; last_name?: string | null; email?: string | null };
export type Category = { id: number; name: string; slug: string; image?: { src: string } | null; children?: Category[] };
export type Template = { id: number; template_title?: string | null; name?: string; preview?: { src: string } | null; photo?: { src: string } | null; product: Product; product_color: ProductColor; canvas?: any };
export type Site = { banners: { id: number; title: string; subtitle?: string; button_text?: string; link?: string; image?: { src: string } | null }[]; pages: { slug: string; title: string }[]; contact: Record<string, string | null>; languages: string[] };
export type Page = { slug: string; title: string; content: string };
export type Order = { id: number; number: string; status: string; status_label: string; payment_status: string; total: string; created_at: string; items_count?: number; items?: any[]; histories?: any[]; recipient_name: string; delivery_address: string };

export type ReadyProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  old_price?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
  sizes: string[];
  specs?: { name: string; value: string }[];
  quantity: number;
  sold_count?: number;
  image?: string | null;
  images?: { id: number; src: string }[];
  rating?: number;
  reviews_count?: number;
};

export type Address = {
  id: number;
  label?: string | null;
  recipient_name: string;
  recipient_phone: string;
  region?: string | null;
  city?: string | null;
  street: string;
  apartment?: string | null;
  landmark?: string | null;
  note?: string | null;
  is_default: boolean;
  full: string;
};

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  reply: string | null;
  author?: string;
  created_at: string;
};

export type ReviewSummary = { count: number; average: number | null; breakdown: Record<string, number> };

export const api = {
  fonts: () => request<{ data: Font[] }>('/fonts').then((r) => r.data),
  cliparts: () => request<{ data: Clipart[] }>('/cliparts').then((r) => r.data),
  phrases: () => request<{ data: Phrase[] }>('/phrases').then((r) => r.data),
  products: (params = '') => request<{ data: Product[] }>('/products?per_page=50' + params).then((r) => r.data),
  categories: () => request<{ data: Category[] }>('/categories').then((r) => r.data),
  orders: () => request<{ data: Order[] }>('/orders?per_page=50').then((r) => r.data),
  order: (id: number | string) => request<{ data: Order }>(`/orders/${id}`).then((r) => r.data),
  site: () => request<{ data: Site }>('/site').then((r) => r.data),
  page: (slug: string) => request<{ data: Page }>(`/pages/${slug}`).then((r) => r.data),
  adminDesign: (id: string | number) => request<{ data: any }>(`/admin/designs/${id}`).then((r) => r.data),
  adminSaveDesign: (id: string | number, body: Record<string, unknown>) => request<{ data: any }>(`/admin/designs/${id}`, { method: 'PUT', json: body }).then((r) => r.data),
  templates: () => request<{ data: Template[] }>('/templates').then((r) => r.data),
  template: (id: number | string) => request<{ data: Template }>(`/templates/${id}`).then((r) => r.data),
  addresses: () => request<{ data: Address[] }>('/addresses').then((r) => r.data),
  createAddress: (data: Partial<Address>) => request<{ data: Address }>('/addresses', { method: 'POST', json: data }).then((r) => r.data),
  updateAddress: (id: number, data: Partial<Address>) => request<{ data: Address }>(`/addresses/${id}`, { method: 'PUT', json: data }).then((r) => r.data),
  deleteAddress: (id: number) => request<unknown>(`/addresses/${id}`, { method: 'DELETE' }),
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) =>
    request<{ data: User }>('/auth/profile', { method: 'PUT', json: data }).then((r) => r.data),
  readyProducts: () => request<{ data: ReadyProduct[] }>('/ready-products?per_page=100').then((r) => r.data),
  readyProduct: (slug: string) => request<{ data: ReadyProduct }>(`/ready-products/${slug}`).then((r) => r.data),
  reviews: (q: { product_id?: number; design_id?: number; ready_product_id?: number }) =>
    request<{ data: Review[] }>(`/reviews?${new URLSearchParams(
      Object.entries(q).filter(([, v]) => v).map(([k, v]) => [`filter[${k}]`, String(v)])
    )}`).then((r) => r.data),
  reviewSummary: (q: { product_id?: number; design_id?: number; ready_product_id?: number }) =>
    request<{ data: ReviewSummary }>(`/reviews/summary?${new URLSearchParams(
      Object.entries(q).filter(([, v]) => v).map(([k, v]) => [k, String(v)])
    )}`).then((r) => r.data),
  createReview: (data: { product_id?: number; design_id?: number; ready_product_id?: number; rating: number; comment?: string }) =>
    request<{ data: Review }>('/reviews', { method: 'POST', body: JSON.stringify(data) }).then((r) => r.data),
  payUrl: (orderId: number, provider: string) => request<{ data: { url: string } }>(`/orders/${orderId}/pay-url?provider=${provider}`).then((r) => r.data.url),
  paymentStatus: (orderId: number | string) => request<{ data: { number: string; payment_status: string; total: string } }>(`/orders/${orderId}/payment-status`).then((r) => r.data),
  cancelOrder: (id: number | string) => request<{ data: Order }>(`/orders/${id}/cancel`, { method: 'POST' }).then((r) => r.data),
  product: (slug: string) => request<{ data: Product }>(`/products/${slug}`).then((r) => r.data),

  login: (login: string, password: string) =>
    request<{ data: { user: User; token: string } }>('/auth/login', { method: 'POST', json: { login, password } }).then((r) => {
      setToken(r.data.token);
      return r.data.user;
    }),
  register: (first_name: string, phone_number: string, password: string) =>
    request<{ data: { user: User; token: string } }>('/auth/register', { method: 'POST', json: { first_name, phone_number, password } }).then((r) => {
      setToken(r.data.token);
      return r.data.user;
    }),
  me: () => request<{ data: User }>('/auth/me').then((r) => r.data),
  logout: () => request('/auth/logout', { method: 'POST' }).finally(() => setToken(null)),

  upload: async (blob: Blob, filename: string) => {
    const fd = new FormData();
    fd.append('file', blob, filename);
    const r = await request<{ data: { id: number; src: string }[] }>('/files', { method: 'POST', body: fd });
    return r.data[0];
  },
  createDesign: (payload: Record<string, unknown>) => request<{ data: { id: number } }>('/designs', { method: 'POST', json: payload }).then((r) => r.data),
  createOrder: (payload: Record<string, unknown>) =>
    request<{ data: { id: number; number: string; total: string } }>('/orders', { method: 'POST', json: payload }).then((r) => r.data),
};

/** data:URL → Blob (yuklangan rasmlarni serverga jo'natish uchun) */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}
