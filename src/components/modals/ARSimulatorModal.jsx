import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import Card3DCanvas from '../3d/Card3DCanvasLazy';
import {
  X,
  Box,
  Maximize,
  Sparkles,
  Layers,
  CheckCircle2,
  Camera,
  Coffee,
  CreditCard,
  Laptop,
} from 'lucide-react';
import { sound } from '../../utils/audio';

const SCALE_OBJECTS = [
  { id: 'card', name: 'Credit Card', width: '8.5 cm', height: '5.4 cm', icon: CreditCard },
  { id: 'mug', name: 'Coffee Mug', width: '8.0 cm', height: '9.5 cm', icon: Coffee },
  { id: 'laptop', name: '15" Laptop', width: '35.0 cm', height: '24.0 cm', icon: Laptop },
];

export default function ARSimulatorModal() {
  const { isAROpen, setIsAROpen, arProduct } = useStore();
  const [activeScaleObj, setActiveScaleObj] = useState(SCALE_OBJECTS[0]);

  if (!isAROpen || !arProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-white/85 backdrop-blur-xl animate-in fade-in duration-200">

      <div className="relative w-full max-w-4xl rounded-3xl glass-panel border border-purple-500/30 bg-white/95 p-4 sm:p-6 space-y-6 shadow-2xl my-auto max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-900/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-slate-900 truncate">
                AR & Physical Scale Simulator
              </h2>
              <p className="text-xs text-slate-500 font-mono truncate">
                {arProduct.name} • 1:1 True Dimensional Projection
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsAROpen(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/5 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AR Viewport Camera Grid Area */}
        <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-gradient-to-b from-white via-slate-50 to-white border border-purple-500/30 overflow-hidden flex items-center justify-center">
          
          {/* Futuristic Camera HUD Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f710_1px,transparent_1px),linear-gradient(to_bottom,#a855f710_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

          {/* Center Targeting Reticle */}
          <div className="absolute inset-x-8 inset-y-8 border border-purple-500/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
            <div className="flex justify-between text-[10px] font-mono text-purple-400 uppercase tracking-wider">
              <span>FOV: 58.4° HORIZONTAL</span>
              <span>CALIBRATION: 1:1 TRUE SCALE</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-purple-400 uppercase tracking-wider">
              <span>DEPTH SENSOR: ACTIVE</span>
              <span>SURFACE: RECOGNIZED</span>
            </div>
          </div>

          {/* 3D Product Canvas Centered */}
          <div className="w-64 h-64 z-10">
            <Card3DCanvas product={arProduct} isHovered={true} />
          </div>

          {/* Comparison Scale Ghost Graphic */}
          <div className="absolute right-8 bottom-8 p-3 rounded-xl glass-panel border border-slate-900/10 text-xs font-mono text-slate-600 z-10 flex items-center gap-2">
            <activeScaleObj.icon className="w-4 h-4 text-purple-400" />
            <div>
              <span className="font-bold text-slate-900 block">{activeScaleObj.name} Reference</span>
              <span className="text-[10px] text-slate-500">{activeScaleObj.width} × {activeScaleObj.height}</span>
            </div>
          </div>
        </div>

        {/* Controls & Dimensions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          
          {/* Reference Scale Switcher */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Compare Against Everyday Object:
            </span>
            <div className="flex items-center gap-2">
              {SCALE_OBJECTS.map(obj => {
                const Icon = obj.icon;
                const isSelected = activeScaleObj.id === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveScaleObj(obj);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-500/20 border border-purple-400 text-purple-300 font-bold'
                        : 'glass-panel border-slate-900/10 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{obj.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimensional Specs */}
          <div className="p-3 rounded-2xl glass-panel border border-slate-900/10 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">WEIGHT / MASS</span>
              <span className="text-slate-900 font-bold">{arProduct.specs['Weight'] || '240 grams'}</span>
            </div>
            <div className="h-6 w-px bg-white/5" />
            <div>
              <span className="text-slate-500 block text-[10px]">MATERIAL DENSITY</span>
              <span className="text-cyan-400 font-bold">Aerospace Spec</span>
            </div>
            <div className="h-6 w-px bg-white/5" />
            <div>
              <span className="text-slate-500 block text-[10px]">PROJECTION</span>
              <span className="text-emerald-400 font-bold">Spatial 6-DoF</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
