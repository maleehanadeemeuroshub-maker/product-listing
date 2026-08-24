import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search products..." }) {
  return (
    <div className="relative flex-1">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-overlay/8 bg-base-900 py-2.5 pl-10 pr-9 text-sm text-base-100 placeholder:text-base-400 transition focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-400 transition hover:text-base-100"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
