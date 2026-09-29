import { t } from '../../i18n';
import React, { useState } from 'react';
import { X, Download, Camera, Printer, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEditorStore } from '../../store/editorStore';
import {
  ExportOptions,
  ExportFormat,
  ExportTarget,
  MockupBackground,
  ExportResolution,
} from '../../types/export';
import { capture3DMockup, generatePrintArtwork, downloadFile } from '../../utils/imageExporter';

interface ExportModalProps {
  canvas3DRef?: React.RefObject<HTMLCanvasElement>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ canvas3DRef }) => {
  const isOpen = useEditorStore((s) => s.isExportModalOpen);
  const setOpen = useEditorStore((s) => s.setExportModalOpen);
  const layers = useEditorStore((s) => s.layers);
  const colors = useEditorStore((s) => s.colors);
  const activeZone = useEditorStore((s) => s.activeZone);

  const [target, setTarget] = useState<ExportTarget>('3d_mockup');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution] = useState<ExportResolution>('2x');
  const [background, setBackground] = useState<MockupBackground>('studio');
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [fileName, setFileName] = useState('custom-tshirt-design');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        target,
        format,
        resolution,
        background,
        includeMeasurements,
        fileName,
      };

      if (target === '3d_mockup') {
        const canvas =
          canvas3DRef?.current || (document.querySelector('canvas[data-engine]') as HTMLCanvasElement);
        if (!canvas) {
          throw new Error('3D Canvas viewport not found');
        }

        const result = await capture3DMockup(canvas, options);
        downloadFile(result, `${fileName}-3d-mockup.${format}`);
      } else {
        const result = await generatePrintArtwork(layers, colors, activeZone, options);
        downloadFile(result, `${fileName}-print-${activeZone}.${format}`);
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setOpen(false);

      // Automatically trigger feedback modal after export to collect impressions!
      setTimeout(() => {
      }, 1000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('Dizaynni yuklab olish')}</h2>
              <p className="text-xs text-slate-500">{t('3D ko\'rinish yoki bosmaga tayyor faylni yuklab oling')}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTarget('3d_mockup')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              target === '3d_mockup'
                ? 'bg-primary-600/15 border-primary-500 text-white shadow-lg'
                : 'bg-slate-100/60 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Camera className="w-4 h-4 text-primary-400" />{t('3D surat')}</div>
            <p className="text-xs text-slate-500 mt-1">{t('Hozirgi 3D burchakdan fotorealistik rasm')}</p>
          </button>

          <button
            onClick={() => setTarget('print_template')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              target === 'print_template'
                ? 'bg-primary-600/15 border-primary-500 text-white shadow-lg'
                : 'bg-slate-100/60 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Printer className="w-4 h-4 text-success-400" />{t('Bosma uchun tekis fayl')}</div>
            <p className="text-xs text-slate-500 mt-1">{t('Yuqori sifatli, qatlamlar saqlangan ishlab chiqarish fayli')}</p>
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('Fayl formati')}</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'png', label: t('PNG rasm'), desc: t('Sifat yo\'qotilmaydi, shaffof fon') },
              { id: 'jpg', label: 'JPEG / JPG', desc: t('Standart siqilgan format') },
              { id: 'psd', label: 'Adobe PSD', desc: t('Qatlamli Photoshop fayli') },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`p-3 rounded-xl border text-left transition ${
                  format === f.id
                    ? 'bg-primary-600 text-white border-primary-400 shadow-md'
                    : 'bg-slate-100/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{f.label}</div>
                <div
                  className={`text-[10px] truncate ${format === f.id ? 'text-primary-100' : 'text-slate-500'}`}
                >
                  {f.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Options (if 3D Mockup) */}
        {target === '3d_mockup' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('Fon')}</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'transparent', label: t('Shaffof') },
                { id: 'studio', label: t('Qorong\'i studiya') },
                { id: 'white', label: t('Oq') },
                { id: 'gradient', label: t('Nur') },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                    background === bg.id
                      ? 'bg-primary-600/30 border-primary-500 text-primary-200 shadow'
                      : 'bg-slate-100/60 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Print template extra options */}
        {target === 'print_template' && (
          <div className="p-3 bg-slate-100/60 rounded-xl flex items-center justify-between border border-slate-200">
            <div className="text-xs text-slate-600 font-medium">{t('Bosma chegaralari va 300 DPI o\'lchamlarni qo\'shish')}</div>
            <button
              onClick={() => setIncludeMeasurements(!includeMeasurements)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                includeMeasurements
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {includeMeasurements ? t('Qo\'shilgan') : t('Yo\'q')}
            </button>
          </div>
        )}

        {/* Filename input */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500">{t('Fayl nomi')}</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >{t('Bekor qilish')}</button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />{t('Tayyorlanmoqda...')}</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('Yuklab olish')} {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
