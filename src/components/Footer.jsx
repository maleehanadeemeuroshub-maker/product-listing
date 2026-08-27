import React from 'react';
import { Store, ShieldCheck, Zap, Truck, RotateCcw, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-900/10 mt-20 pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-900/10">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border border-slate-900/6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">DummyJSON REST API</h4>
              <p className="text-xs text-slate-500 mt-0.5">Live pagination, category filtering, search, and dynamic product endpoints.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border border-slate-900/6">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Free Express Shipping</h4>
              <p className="text-xs text-slate-500 mt-0.5">Automated free courier eligibility calculation on orders over $100.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border border-slate-900/6">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">State & LocalStorage</h4>
              <p className="text-xs text-slate-500 mt-0.5">Persistent cart & authentication token synchronization across tabs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border border-slate-900/6">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Week 7 Internship</h4>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive demo of Axios, React Router, and Context API concepts.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-600 font-bold">Shoply.io</span>
            <span>— Week 7 Frontend Internship Submission</span>
          </div>
          <p>© 2026 Powered by React, Vite, Tailwind CSS & DummyJSON API</p>
        </div>

      </div>
    </footer>
  );
}
