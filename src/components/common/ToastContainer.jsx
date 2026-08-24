import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl glass-panel border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
              isSuccess
                ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200'
                : isWarning
                ? 'border-amber-500/40 bg-amber-950/80 text-amber-200'
                : 'border-cyan-500/40 bg-slate-950/80 text-cyan-200'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isWarning ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="text-xs font-mono font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
