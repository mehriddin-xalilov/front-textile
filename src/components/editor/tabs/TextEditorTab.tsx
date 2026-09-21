import React from 'react';
import { Plus, Sparkles, Sliders, Italic, Bold } from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import { TextLayer } from '../../../types/editor';

import { useShopStore } from '../../../store/shopStore';

const BASE_FONTS = [
  { name: 'Permanent Marker', style: 'Graffiti / Street' },
  { name: 'Anton', style: 'Bold Poster' },
  { name: 'Montserrat', style: 'Modern Sans' },
  { name: 'Playfair Display', style: 'Elegant Serif' },
  { name: 'Pacifico', style: 'Retro Script' },
  { name: 'Orbitron', style: 'Cyber Futuristic' },
  { name: 'Bangers', style: 'Comic / Pop Art' },
  { name: 'Cinzel', style: 'Classical Roman' },
  { name: 'Righteous', style: 'Vintage 80s' },
  { name: 'Russo One', style: 'Heavy Block' },
  { name: 'Caveat', style: 'Handwritten' },
  { name: 'Bungee', style: 'Urban Signage' },
  { name: 'Inter', style: 'Clean Minimal' },
];

const BASE_PRESETS = [
  {
    name: 'Varsity Arch',
    text: 'BROOKLYN\nATHLETICS',
    fontFamily: 'Russo One',
    fontSize: 42,
    curved: true,
    curveRadius: 260,
    fillColor: '#FFFFFF',
    strokeColor: '#3B82F6',
    strokeWidth: 3,
  },
  {
    name: 'Cyberpunk Neon',
    text: 'NEO TOKYO 2099',
    fontFamily: 'Orbitron',
    fontSize: 34,
    curved: false,
    curveRadius: 0,
    fillColor: '#00F0FF',
    strokeColor: '#9D00FF',
    strokeWidth: 2,
  },
  {
    name: 'Vintage Script',
    text: 'Golden State Club',
    fontFamily: 'Pacifico',
    fontSize: 46,
    curved: true,
    curveRadius: 320,
    fillColor: '#FBBF24',
    strokeColor: '#1E293B',
    strokeWidth: 2,
  },
  {
    name: 'Streetwear Stamp',
    text: 'WORLDWIDE\nSUPPLY CO.',
    fontFamily: 'Anton',
    fontSize: 48,
    curved: false,
    curveRadius: 0,
    fillColor: '#F43F5E',
    strokeColor: '#000000',
    strokeWidth: 3,
  },
];

export const TextEditorTab: React.FC = () => {
  const activeZone = useEditorStore((s) => s.activeZone);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const layers = useEditorStore((s) => s.layers);
  const addLayer = useEditorStore((s) => s.addLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const fonts = useShopStore((s) => s.fonts);
  const phrases = useShopStore((s) => s.phrases);
  // Asl shriftlar + bizning API shriftlari (takrorsiz)
  const GOOGLE_FONTS = [...BASE_FONTS, ...fonts.filter((f) => !BASE_FONTS.some((b) => b.name === f.family)).map((f) => ({ name: f.family, style: f.category }))];
  const BASE = BASE_PRESETS.map((p) => ({ ...p, fontWeight: '700', fontStyle: 'normal' as const, category: 'studio' }));
  const TREND = phrases.map((p) => ({ name: p.text, text: p.text, fontFamily: p.font_family, fontSize: 40, fontWeight: p.font_weight, fontStyle: p.font_style, curved: false, curveRadius: 0, fillColor: p.fill, strokeColor: undefined as string | undefined, strokeWidth: 0, category: p.category }));
  const TEXT_PRESETS = [...TREND, ...BASE];

  const selectedLayer = layers.find((l) => l.id === selectedLayerId && l.type === 'text') as
    TextLayer | undefined;

  const handleAddNewText = () => {
    addLayer({
      name: 'Custom Text',
      type: 'text',
      zone: activeZone,
      text: 'YOUR TEXT HERE',
      fontFamily: 'Montserrat',
      fontSize: 40,
      fontWeight: '700',
      fontStyle: 'normal',
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 0,
      curved: false,
      curveRadius: 250,
      letterSpacing: 2,
      lineHeight: 1.1,
      textAlign: 'center',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      x: 0.5,
      y: 0.5,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
    });
  };

  const applyPreset = (preset: (typeof TEXT_PRESETS)[0]) => {
    addLayer({
      name: preset.name,
      type: 'text',
      zone: activeZone,
      text: preset.text,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
      fillColor: preset.fillColor,
      strokeColor: preset.strokeColor,
      strokeWidth: preset.strokeWidth,
      curved: preset.curved,
      curveRadius: preset.curveRadius,
      letterSpacing: 2,
      lineHeight: 1.1,
      textAlign: 'center',
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(0,0,0,0.5)',
      x: 0.5,
      y: 0.5,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Add New Text Button */}
      <button
        onClick={handleAddNewText}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 text-xs transition-all duration-200 hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4" />
        Add New Text Layer
      </button>

      {/* Selected Text Controls */}
      {selectedLayer ? (
        <div className="p-4 bg-white/80 rounded-2xl border border-primary-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Edit Typography
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  updateLayer(selectedLayer.id, {
                    fontWeight: selectedLayer.fontWeight === '900' ? '400' : '900',
                  })
                }
                title="Bold"
                className={`p-1.5 rounded-lg border text-xs ${
                  selectedLayer.fontWeight === '900'
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  updateLayer(selectedLayer.id, {
                    fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                title="Italic"
                className={`p-1.5 rounded-lg border text-xs ${
                  selectedLayer.fontStyle === 'italic'
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500">Content</label>
            <textarea
              value={selectedLayer.text}
              onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
              rows={2}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-primary-500 resize-none font-medium"
            />
          </div>

          {/* Font Family Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500">Font Family</label>
            <select
              value={selectedLayer.fontFamily}
              onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-primary-500 font-semibold"
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                  {f.name} ({f.style})
                </option>
              ))}
            </select>
          </div>

          {/* Colors: Fill & Stroke */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedLayer.fillColor}
                  onChange={(e) => updateLayer(selectedLayer.id, { fillColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-[11px] font-mono text-slate-600 uppercase">
                  {selectedLayer.fillColor}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">Stroke / Outline</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedLayer.strokeColor || '#000000'}
                  onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selectedLayer.strokeWidth}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { strokeWidth: parseInt(e.target.value) })
                  }
                  className="w-16 accent-primary-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  title="Outline thickness"
                />
              </div>
            </div>
          </div>

          {/* Curved Text Toggle */}
          <div className="p-3 bg-slate-100/60 rounded-xl space-y-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Curved / Arched Text</span>
              <button
                onClick={() => updateLayer(selectedLayer.id, { curved: !selectedLayer.curved })}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition ${
                  selectedLayer.curved
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                {selectedLayer.curved ? 'Enabled' : 'Off'}
              </button>
            </div>

            {selectedLayer.curved && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Curve Radius</span>
                  <span>{selectedLayer.curveRadius}px</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="600"
                  step="10"
                  value={selectedLayer.curveRadius}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, { curveRadius: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Font Size & Letter Spacing */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Font Size</span>
                <span>{selectedLayer.fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="120"
                value={selectedLayer.fontSize}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })
                }
                className="w-full accent-primary-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Letter Spacing</span>
                <span>{selectedLayer.letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="24"
                value={selectedLayer.letterSpacing}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { letterSpacing: parseInt(e.target.value) })
                }
                className="w-full accent-primary-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/40 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Click any text layer in the preview or add a new layer above to edit styling.
        </div>
      )}

      {/* Typography Style Presets */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          Trend so'zlar va shablonlar
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {TEXT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="p-3 bg-white/70 rounded-2xl border border-slate-200 hover:border-primary-500/60 hover:bg-slate-100/60 transition group text-left"
            >
              <div
                className="text-sm font-bold truncate group-hover:text-primary-400"
                style={{ fontFamily: p.fontFamily, color: p.fillColor === '#111111' ? '#e5e7eb' : p.fillColor, fontWeight: p.fontWeight, fontStyle: p.fontStyle }}
              >
                {p.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">{p.fontFamily} · {p.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
