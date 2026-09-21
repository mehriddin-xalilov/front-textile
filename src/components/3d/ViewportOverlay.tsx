import React from 'react';
import { RotateCw, Sun, Grid3X3, Compass, Sunrise, Sparkles, CloudSun, MoonStar, Circle, LucideIcon } from 'lucide-react';
import { useSceneStore, LightingPreset } from '../../store/sceneStore';
import { useEditorStore } from '../../store/editorStore';

export const ViewportOverlay: React.FC = () => {
  const cameraPreset = useSceneStore((s) => s.cameraPreset);
  const setCameraPreset = useSceneStore((s) => s.setCameraPreset);
  const lightingPreset = useSceneStore((s) => s.lightingPreset);
  const setLightingPreset = useSceneStore((s) => s.setLightingPreset);
  const isTurntableActive = useSceneStore((s) => s.isTurntableActive);
  const toggleTurntable = useSceneStore((s) => s.toggleTurntable);
  const wireframe = useSceneStore((s) => s.wireframe);
  const toggleWireframe = useSceneStore((s) => s.toggleWireframe);
  const activeZone = useEditorStore((s) => s.activeZone);

  const lightingPresets: { id: LightingPreset; label: string; Icon: LucideIcon }[] = [
    { id: 'studio_clean', label: 'Studiya', Icon: Circle },
    { id: 'warm_sunset', label: 'Iliq quyosh botishi', Icon: Sunrise },
    { id: 'cyber_neon', label: 'Neon', Icon: Sparkles },
    { id: 'daylight', label: 'Kunduzgi yorug\'lik', Icon: CloudSun },
    { id: 'dramatic', label: "Qorong'i", Icon: MoonStar },
  ];

  const cycleLighting = () => {
    const ids = lightingPresets.map((l) => l.id);
    const currIdx = ids.indexOf(lightingPreset);
    const nextIdx = (currIdx + 1) % ids.length;
    setLightingPreset(ids[nextIdx]);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pointer-events-auto mt-12 lg:mt-0">
        {/* Left: View Badge & 3D Perspective Angle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop-only view badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
            <span className="capitalize">{activeZone.replace('_', ' ')} View</span>
          </div>

          <button
            onClick={() => setCameraPreset('isometric')}
            title="Switch to 3D Isometric Perspective"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
              cameraPreset === 'isometric'
                ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-600/30'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-primary-400" />
            <span>3D Angle</span>
          </button>
        </div>

        {/* Right: Lighting & Wireframe Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop: Full 5-preset lighting bar */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg">
            <div className="px-2 py-1 text-slate-500 text-xs flex items-center gap-1 font-medium">
              <Sun className="w-3.5 h-3.5 text-accent-400" />
              <span className="hidden sm:inline">Light:</span>
            </div>
            {lightingPresets.map((l) => (
              <button
                key={l.id}
                title={l.label}
                onClick={() => setLightingPreset(l.id)}
                className={`p-1.5 px-2 rounded-lg text-xs transition-all ${
                  lightingPreset === l.id
                    ? 'bg-slate-900 text-white shadow font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <l.Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Mobile: Compact cycle button */}
          <button
            onClick={cycleLighting}
            title={`Cycle Light: ${lightingPresets.find((l) => l.id === lightingPreset)?.label}`}
            className="flex md:hidden items-center gap-1 px-2.5 py-1.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <Sun className="w-3.5 h-3.5 text-accent-400" />
            {(() => {
              const Active = lightingPresets.find((l) => l.id === lightingPreset)?.Icon ?? Circle;

              return <Active className="w-3.5 h-3.5" />;
            })()}
          </button>

          <button
            onClick={toggleWireframe}
            title="Toggle Wireframe Mesh"
            className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-md transition-all ${
              wireframe
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-white/80 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="flex items-end justify-between pointer-events-auto mb-20 lg:mb-0">
        <button
          onClick={toggleTurntable}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all duration-200 shadow-xl ${
            isTurntableActive
              ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 border-secondary-400 text-white shadow-secondary-500/25 animate-pulse'
              : 'bg-white/80 border-slate-200 text-slate-800 hover:bg-slate-100'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isTurntableActive ? 'animate-spin' : ''}`} />
          <span>{isTurntableActive ? 'Turntable' : '360° Spin'}</span>
        </button>

        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200 text-[11px] text-slate-500 font-medium">
          <span>• Left Click + Drag: Rotate</span>
          <span>• Scroll: Zoom</span>
          <span>• Right Click: Pan</span>
        </div>
      </div>
    </div>
  );
};
