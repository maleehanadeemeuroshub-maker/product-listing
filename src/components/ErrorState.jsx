import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  message = 'Failed to load products from the REST API.',
  onRetry,
}) {
  return (
    <div className="w-full py-16 px-6 rounded-3xl glass-panel border border-rose-500/30 bg-rose-950/10 text-center space-y-4 max-w-lg mx-auto my-8 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto animate-bounce">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
          API Connection Error
        </h3>
        <p className="text-xs text-rose-200/80 font-mono leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-mono font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
