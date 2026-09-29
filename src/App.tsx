import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/common/Navbar';
import { EditorSidebar } from './components/editor/EditorSidebar';
import { StudioScene } from './components/3d/StudioScene';
import { Canvas2DStage } from './components/editor/Canvas2DStage';
import { ExportModal } from './components/export/ExportModal';
import { ProjectSaveModal } from './components/export/ProjectSaveModal';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { LandingPage } from './components/landing/LandingPage';
import { ChangelogPage } from './components/changelog/ChangelogPage';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { MobileBottomDock } from './components/editor/mobile/MobileBottomDock';
import { MobileBottomSheet } from './components/editor/mobile/MobileBottomSheet';
import { MobileZoneBar } from './components/editor/mobile/MobileZoneBar';
import { useEditorStore } from './store/editorStore';
import { useShopStore } from './store/shopStore';
import { AuthModal } from './components/shop/AuthModal';
import { OrderModal } from './components/shop/OrderModal';
import { api, setToken } from './services/api';
import { t } from './i18n';

/**
 * Embed rejimi (?embed=view): faqat 3D sahna, sidebar/navbar yo'q.
 * Ota oyna postMessage bilan dizaynni yuboradi: { type: 'tx:load', product: slug, canvas: {colors, layers} }.
 * Admin panel shu rejimda buyurtma/dizaynni xuddi konstruktordagidek ko'rsatadi.
 */
const EmbedViewer: React.FC<{ canvas3DRef: React.RefObject<HTMLCanvasElement> }> = ({ canvas3DRef }) => {
  const loadProject = useEditorStore((s) => s.loadProject);
  const setColor = useEditorStore((s) => s.setColor);
  const selectProduct = useShopStore((s) => s.selectProduct);
  const products = useShopStore((s) => s.products);

  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      if (!e.data || e.data.type !== 'tx:load') return;
      if (e.data.product && products.length) await selectProduct(e.data.product);
      const c = e.data.canvas || {};
      loadProject({ version: '2', timestamp: Date.now(), title: 'design', colors: c.colors, layers: c.layers || [] });
      if (c.colors?.body) setColor('all', c.colors.body);
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: 'tx:ready' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, [loadProject, setColor, selectProduct, products.length]);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-white to-slate-100">
      <StudioScene canvasRef={canvas3DRef} background="light" />
    </div>
  );
};

export const StudioApp: React.FC = () => {
  // Konstruktor: sahifa scroll qilinmasin (sayt sahifalarida scroll kerak)
  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'select-none');
    return () => document.body.classList.remove('overflow-hidden', 'select-none');
  }, []);
  const [viewMode, setViewMode] = useState<'3d' | 'split' | '2d'>('split');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);

  const activePage = useEditorStore((s) => s.activePage);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const setExportModalOpen = useEditorStore((s) => s.setExportModalOpen);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const bootstrap = useShopStore((s) => s.bootstrap);
  const shopLoading = useShopStore((s) => s.loading);
  const shopError = useShopStore((s) => s.error);

  // Mahsulot: ?product=<slug>, bo'lmasa birinchi mahsulot (bootstrap bir marta, store bo'sh bo'lsa)
  const productSlug = new URLSearchParams(window.location.search).get('product') || undefined;
  const loadedProduct = useShopStore((s) => s.product);
  const selectProduct = useShopStore((s) => s.selectProduct);
  const templateId = new URLSearchParams(window.location.search).get('template');
  const designId = new URLSearchParams(window.location.search).get('design');   // admin tahrirlash
  const isEmbedMode = new URLSearchParams(window.location.search).get('embed') === 'view';
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const setEditingDesignId = useShopStore((s) => s.setEditingDesignId);
  // Admin paneldan: #token=... (admin tokeni) — sessiyaga yoziladi
  const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
  if (hashToken) { setToken(hashToken); window.history.replaceState({}, '', window.location.pathname + window.location.search); }
  const loadProject = useEditorStore((s) => s.loadProject);
  const setColor = useEditorStore((s) => s.setColor);
  useEffect(() => {
    (async () => {
      if (!loadedProduct) await bootstrap(productSlug);
      else if (productSlug && loadedProduct.slug !== productSlug) await selectProduct(productSlug);
      // Tayyor dizayn: mahsulot + rang + qatlamlar yuklanadi, mijoz o'zgartirib buyurtma beradi
      if (designId) {
        // Admin: mijoz dizaynini (yoki shablonni) ochish
        const d = await api.adminDesign(designId);
        await useShopStore.getState().selectProduct(d.product.slug);
        const pc = useShopStore.getState().product?.colors.find((c) => c.id === d.product_color_id);
        if (pc) useShopStore.getState().selectColor(pc);
        const c = d.canvas || {};
        if (c.layers) loadProject({ version: '2', timestamp: Date.now(), title: d.name || '', colors: c.colors, layers: c.layers });
        if (c.colors?.body) setColor('all', c.colors.body);
        setEditingDesignId(Number(designId));
      }
      if (templateId) {
        const t = await api.template(templateId);
        await useShopStore.getState().selectProduct(t.product.slug);
        const pc = useShopStore.getState().product?.colors.find((c) => c.id === t.product_color.id);
        if (pc) useShopStore.getState().selectColor(pc);
        const c = t.canvas || {};
        if (c.layers) loadProject({ version: '2', timestamp: Date.now(), title: t.template_title || 'template', colors: c.colors, layers: c.layers });
        if (c.colors?.body) setColor('all', c.colors.body);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && viewMode === 'split') {
        setViewMode('3d');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        setExportModalOpen(true);
        e.preventDefault();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && selectedLayerId) {
        deleteLayer(selectedLayerId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedLayerId, deleteLayer, setExportModalOpen]);

  if (isEmbedMode) {
    return <EmbedViewer canvas3DRef={canvas3DRef} />;
  }

  // Kirmagan foydalanuvchi konstruktorga kirolmaydi
  if (!shopLoading && !user && !designId) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="text-2xl font-black text-slate-900">{t('Konstruktor')}</div>
        <p className="text-slate-600 max-w-sm">{t("Konstruktorga kirish uchun avval ro'yxatdan o'ting yoki kiring.")}</p>
        <div className="flex gap-3">
          <a href="/" className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm">{t('Bosh sahifaga')}</a>
          <button onClick={() => setAuthOpen(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-bold">{t("Kirish / Ro'yxatdan o'tish")}</button>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans text-slate-800 select-none">
      {/* Top Navigation Bar */}
      <Navbar viewMode={viewMode} setViewMode={setViewMode} />

      {/* Main Content Router */}
      <div className="flex-1 overflow-hidden relative">
        {activePage === 'landing' && <LandingPage />}

        {activePage === 'changelog' && <ChangelogPage />}

        {activePage === 'terms' && <TermsPage />}

        {activePage === 'privacy' && <PrivacyPolicyPage />}

        {activePage === 'studio' && (
          <div className="w-full h-full flex flex-row overflow-hidden relative">
            {/* Desktop Dedicated Sidebar */}
            <EditorSidebar />

            {/* Mobile Top Zone Selector Bar (Front, Back, Left, Right) */}
            <MobileZoneBar />

            {/* Viewport Canvas Area (100% full screen on mobile) */}
            <main className="flex-1 h-full min-h-0 flex overflow-hidden relative bg-white">
              {(viewMode === '3d' || viewMode === 'split') && (
                <div
                  className={`h-full relative transition-all duration-300 ${
                    viewMode === 'split'
                      ? 'w-full lg:w-1/2 border-r border-slate-200'
                      : 'w-full'
                  }`}
                >
                  <StudioScene canvasRef={canvas3DRef} />
                </div>
              )}

              {(viewMode === '2d' || viewMode === 'split') && (
                <div
                  className={`h-full relative transition-all duration-300 bg-white/60 ${
                    viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
                  }`}
                >
                  <Canvas2DStage />
                </div>
              )}
            </main>

            {/* Mobile Floating Bottom Dock & Slide-Up Sheet */}
            <MobileBottomDock
              isSheetOpen={isMobileSheetOpen}
              onOpenSheet={(tab) => {
                if (tab) setActiveTab(tab);
                setIsMobileSheetOpen(true);
              }}
              onToggleSheet={() => setIsMobileSheetOpen((prev) => !prev)}
            />

            <MobileBottomSheet
              isOpen={isMobileSheetOpen}
              onClose={() => setIsMobileSheetOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ExportModal canvas3DRef={canvas3DRef} />
      <AuthModal />
      <OrderModal canvas3DRef={canvas3DRef} />
      {(shopLoading && !loadedProduct || shopError) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 text-sm text-slate-600">{shopError || 'Yuklanmoqda...'}</div>
      )}
      <ProjectSaveModal />
      <FeedbackModal />
    </div>
  );
};

import { Routes, Route, useLocation } from 'react-router-dom';
import { ShopLayout } from './shop/ShopLayout';
import { HomePage } from './shop/pages/HomePage';
import { ProductPage } from './shop/pages/ProductPage';
import { OrdersPage } from './shop/pages/OrdersPage';
import { OrderPage } from './shop/pages/OrderPage';
import { ProfilePage } from './shop/pages/ProfilePage';
import { PaymentResultPage } from './shop/pages/PaymentResultPage';
import { ThumbsTool } from './tools/ThumbsTool';
import { StaticPage } from './shop/pages/StaticPage';
import { ReadyProductPage } from './shop/pages/ReadyProductPage';
import { CartPage } from './shop/pages/CartPage';
import { FavoritesPage } from './shop/pages/FavoritesPage';
import { AddressesPage } from './shop/pages/AddressesPage';
import { ReadyPage } from './shop/pages/ReadyPage';

/** Mijoz sayti: katalog + konstruktor (/studio) + buyurtmalar. ?embed=view — admin uchun 3D ko'rish. */
export const App: React.FC = () => {
  const location = useLocation();
  const bootstrap = useShopStore((s) => s.bootstrap);
  const loaded = useShopStore((s) => s.product);
  const isEmbed = new URLSearchParams(location.search).get('embed') === 'view';
  const lang = useShopStore((s) => s.lang);

  // B2B kampaniya: xatdagi havola `?c=<token>` bilan keladi — bir marta saqlab, serverga "bosildi" deb yozamiz
  useEffect(() => {
    const token = new URLSearchParams(location.search).get('c');
    if (token && /^[A-Za-z0-9]{4,20}$/.test(token)) {
      localStorage.setItem('tx_lead', token);
      api.trackClick(token, location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded && !location.pathname.startsWith('/studio') && !isEmbed) bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isEmbed) return <StudioApp />;

  // key={lang}: til almashganda sahifa qayta yuklanmaydi, faqat yangi tilda qayta chiziladi
  return (
    <Routes key={lang}>
      <Route path="/studio" element={<StudioApp />} />
      <Route path="/tools/thumbs" element={<ThumbsTool />} />
      <Route element={<ShopLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route path="/page/:slug" element={<StaticPage />} />
        <Route path="/ready/:slug" element={<ReadyProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/ready" element={<ReadyPage />} />
      </Route>
    </Routes>
  );
};

export default App;
