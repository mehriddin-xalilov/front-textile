import React from 'react';
import {
  Shirt,
  Undo2,
  Redo2,
  Download,
  SplitSquareVertical,
  Box,
  LayoutTemplate,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useShopStore } from '../../store/shopStore';
import { UserRound, ShoppingBag, Save } from 'lucide-react';
import { AdminSaveButton } from '../shop/AdminSaveButton';

interface NavbarProps {
  viewMode: '3d' | 'split' | '2d';
  setViewMode: (mode: '3d' | 'split' | '2d') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ viewMode, setViewMode }) => {
  const activePage = useEditorStore((s) => s.activePage);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const user = useShopStore((s) => s.user);
  const setAuthOpen = useShopStore((s) => s.setAuthOpen);
  const setOrderOpen = useShopStore((s) => s.setOrderOpen);
  const logout = useShopStore((s) => s.logout);
  const editingDesignId = useShopStore((s) => s.editingDesignId);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const pastLength = useEditorStore((s) => s.history.past.length);
  const futureLength = useEditorStore((s) => s.history.future.length);
  const setExportModalOpen = useEditorStore((s) => s.setExportModalOpen);

  return (
    <header className="h-16 px-3 sm:px-5 lg:px-6 bg-white/90 border-b border-slate-200 backdrop-blur-xl flex items-center justify-between z-30 select-none">
      {/* Brand Logo & App Page Switcher */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Logo */}
        <a
          href="/"
          title="Bosh sahifa"
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-secondary-500 p-0.5 shadow-md shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-primary-400">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase">
                Motex Konstruktor
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">3D dizayn · logo va yozuv</p>
          </div>
        </a>
      </div>

      {/* Studio Viewport Mode Switcher (Desktop & Mobile) */}
      {activePage === 'studio' && (
        <>
          {/* Desktop Controls (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === '3d'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D View</span>
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'split'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>

              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === '2d'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>2D Canvas</span>
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              <button
                onClick={undo}
                disabled={pastLength === 0}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={futureLength === 0}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Controls (< 1024px) */}
          <div className="flex lg:hidden items-center gap-1.5">
            <div className="flex items-center p-0.5 bg-white rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '3d' || viewMode === 'split'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="3D Garment View"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D</span>
              </button>

              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '2d'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="2D Canvas Editor"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>2D</span>
              </button>
            </div>

            <div className="flex items-center p-0.5 bg-white rounded-xl border border-slate-200">
              <button
                onClick={undo}
                disabled={pastLength === 0}
                title="Undo"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 transition"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={futureLength === 0}
                title="Redo"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 transition"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Right Actions: Feedback, Buy Me a Coffee, Save & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Foydalanuvchi */}
        {user ? (
          <button onClick={logout} title="Chiqish" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition">
            <UserRound className="w-3.5 h-3.5 text-primary-400" /><span>{user.full_name}</span>
          </button>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition">
            <UserRound className="w-3.5 h-3.5 text-primary-400" /><span>Kirish</span>
          </button>
        )}

        {/* Project & Export (visible in studio) */}
        {activePage === 'studio' && (
          <>
            <button
              onClick={() => setExportModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-primary-400" />
              <span>Yuklab olish</span>
            </button>

            {editingDesignId ? <AdminSaveButton /> : null}
            <button
              onClick={() => setOrderOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-600/30 transition active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buyurtma</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
