import { ArrowUpDown } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "title-asc", label: "Name: A-Z" },
  { value: "title-desc", label: "Name: Z-A" },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <ArrowUpDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-overlay/8 bg-base-900 py-2.5 pl-9 pr-8 text-sm text-base-100 transition focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-base-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
