import { Star } from "lucide-react";

const OPTIONS = [
  { value: 0, label: "Any Rating" },
  { value: 4.5, label: "4.5★ & up" },
  { value: 4, label: "4★ & up" },
  { value: 3, label: "3★ & up" },
  { value: 2, label: "2★ & up" },
];

export default function RatingFilter({ value, onChange }) {
  return (
    <div className="relative">
      <Star size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-none rounded-xl border border-overlay/8 bg-base-900 py-2.5 pl-9 pr-8 text-sm text-base-100 transition focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-base-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
