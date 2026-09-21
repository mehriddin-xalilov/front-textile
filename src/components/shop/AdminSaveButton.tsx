import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useShopStore } from '../../store/shopStore';
import { useEditorStore } from '../../store/editorStore';
import { api, dataUrlToBlob } from '../../services/api';
import { capture3DMockup, generatePrintArtwork } from '../../utils/imageExporter';
import { DesignZone } from '../../types/shirt';
import { t } from '../../i18n';

/** Admin rejimi (?design=ID): dizaynni tahrirlab saqlash — preview, 300 DPI bosma fayl, canvas → PUT /admin/designs/{id} */
export const AdminSaveButton: React.FC = () => {
  const id = useShopStore((s) => s.editingDesignId);
  const productColor = useShopStore((s) => s.productColor);
  const layers = useEditorStore((s) => s.layers);
  const colors = useEditorStore((s) => s.colors);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const save = async () => {
    if (!id) return;
    setState('busy');
    try {
      const opts = { target: '3d_mockup', format: 'png', resolution: '2x', background: 'transparent', includeMeasurements: false, fileName: 'preview' } as const;
      const canvas = (document.querySelector('canvas[data-engine]') as HTMLCanvasElement);
      const preview = await api.upload((await capture3DMockup(canvas, opts)) as Blob, 'preview.png');
      const zones = (['front', 'back', 'sleeve_left', 'sleeve_right'] as DesignZone[]).filter((z) => layers.some((l) => l.zone === z && l.visible));
      const printFiles: Record<string, number> = {};
      for (const z of zones) printFiles[z] = (await api.upload((await generatePrintArtwork(layers, colors, z, { ...opts, target: 'print_template', resolution: 'print_300dpi' })) as Blob, `print-${z}.png`)).id;
      const saved = [] as any[];
      for (const l of layers) {
        if (l.type === 'image' && l.src.startsWith('data:')) { const f = await api.upload(await dataUrlToBlob(l.src), 'image.png'); saved.push({ ...l, src: f.src, fileId: f.id }); } else saved.push(l);
      }
      await api.adminSaveDesign(id, { canvas: { version: 2, engine: 'shirt-designer-3d', colors, layers: saved, print_files: printFiles }, product_color_id: productColor?.id, preview_file_id: preview.id, print_file_id: printFiles[zones[0]] ?? null });
      setState('done');
      setTimeout(() => setState('idle'), 2500);
    } catch { setState('error'); }
  };

  return (
    <button onClick={save} disabled={state === 'busy'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60">
      <Save className="w-3.5 h-3.5" /> {state === 'busy' ? '...' : state === 'done' ? t('Saqlandi') : state === 'error' ? 'Xato' : t('Saqlash (admin)')}
    </button>
  );
};
