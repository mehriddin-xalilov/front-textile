import React from 'react';
import { Shirt, RotateCcw, MoveLeft, MoveRight, LucideIcon } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSceneStore, CameraPreset } from '../../store/sceneStore';
import { DesignZone } from '../../types/shirt';

export const ZoneSelector: React.FC = () => {
  const activeZone = useEditorStore((s) => s.activeZone);
  const setActiveZone = useEditorStore((s) => s.setActiveZone);
  const layers = useEditorStore((s) => s.layers);
  const setCameraPreset = useSceneStore((s) => s.setCameraPreset);

  const zones: { id: DesignZone; label: string; Icon: LucideIcon; camera: CameraPreset }[] = [
    { id: 'front', label: 'Old', Icon: Shirt, camera: 'front' },
    { id: 'back', label: 'Orqa', Icon: RotateCcw, camera: 'back' },
    { id: 'sleeve_left', label: 'Chap yeng', Icon: MoveLeft, camera: 'sleeve_left' },
    { id: 'sleeve_right', label: "O'ng yeng", Icon: MoveRight, camera: 'sleeve_right' },
  ];

  const handleZoneChange = (zone: DesignZone, camera: CameraPreset) => {
    setActiveZone(zone);
    setCameraPreset(camera);
  };

  return (
    <div className="w-full grid grid-cols-4 gap-1 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg">
      {zones.map((z) => {
        const count = layers.filter((l) => l.zone === z.id).length;
        const isActive = activeZone === z.id;
        return (
          <button
            key={z.id}
            onClick={() => handleZoneChange(z.id, z.camera)}
            className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
            }`}
          >
            <z.Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{z.label}</span>
            {count > 0 && (
              <span
                className={`hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-white text-primary-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
