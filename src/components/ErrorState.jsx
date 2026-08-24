import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center animate-fade-in">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle size={26} className="text-red-400" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-base-100">Something went wrong</h3>
        <p className="mt-1 max-w-sm text-sm text-base-400">{message || "Failed to load data from the server."}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RotateCw size={15} />
          Retry
        </button>
      )}
    </div>
  );
}
