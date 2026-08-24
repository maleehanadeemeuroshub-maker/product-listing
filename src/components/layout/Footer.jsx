import React from 'react';
import { Sparkles, ShieldCheck, Zap, RotateCcw, Truck, Box } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function Footer() {
  return (
    <footer className="w-full bg-[#05070a] border-t border-white/10 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Propositions Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-white/10">
          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel border border-white/5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Real-Time 3D Engine</h4>
              <p className="text-xs text-slate-400 mt-1">Interactive 60fps WebGL rendering with exploded teardown views.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel border border-white/5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Global Express Freight</h4>
              <p className="text-xs text-slate-400 mt-1">Free carbon-neutral courier on all orders over $150.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel border border-white/5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">3-Year Precision Care</h4>
              <p className="text-xs text-slate-400 mt-1">Complimentary hardware warranty & express part replacements.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel border border-white/5">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">30-Day Risk-Free Trial</h4>
              <p className="text-xs text-slate-400 mt-1">Experience true spatial acoustic and computing bliss or 100% refund.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-[1.5px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight font-['Space_Grotesk'] text-white">
                AURA<span className="text-cyan-400">3D</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Pioneering the future of 3D animated e-commerce. Real-time procedural shaders, exploded internal engineering inspection, and spatial audio ergonomics.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                WebGL 2.0 Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
                Three.js Inside
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold mb-4">
              Showcase Labs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">3D Spatial Carousel</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Exploded Teardown Studio</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Material Customizer</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">AR Scale Simulator</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Acoustic Visualizers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#catalog" className="hover:text-cyan-400 transition-colors">Spatial Audio</a></li>
              <li><a href="#catalog" className="hover:text-cyan-400 transition-colors">Titanium Wearables</a></li>
              <li><a href="#catalog" className="hover:text-cyan-400 transition-colors">Cyber Smartphones</a></li>
              <li><a href="#catalog" className="hover:text-cyan-400 transition-colors">Pro Mechanical Gear</a></li>
              <li><a href="#catalog" className="hover:text-cyan-400 transition-colors">4K Drones & Optics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold mb-4">
              Special Privileges
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for exclusive early-drop access, 3D firmware updates, and limited colorway releases.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); sound.playClick(); alert('Subscribed to AURA 3D Inner Circle!'); }} className="space-y-2">
              <input
                type="email"
                required
                placeholder="developer@aura3d.io"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-colors"
              >
                Join Inner Circle
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© 2026 AURA 3D Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Shield</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Experience</a>
            <a href="#" className="hover:text-slate-300 transition-colors">System Telemetry</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
