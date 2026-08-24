import { PackageCheck } from "lucide-react";

export default function AvailabilityFilter({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        value
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-overlay/8 bg-base-900 text-base-300 hover:border-overlay/20 hover:text-base-100"
      }`}
    >
      <PackageCheck size={15} />
      In Stock Only
    </button>
  );
}
