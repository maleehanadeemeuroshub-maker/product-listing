import { SlidersHorizontal } from "lucide-react";

export default function PriceFilter({ min, max, value, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-overlay/8 bg-base-900 px-4 py-2.5">
      <SlidersHorizontal size={15} className="shrink-0 text-base-400" />
      <span className="whitespace-nowrap text-xs text-base-400">
        ${value[0]} &ndash; ${value[1]}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(e) => onChange([value[0], Number(e.target.value)])}
        className="h-1.5 w-32 cursor-pointer accent-accent-500 sm:w-40"
      />
    </div>
  );
}
