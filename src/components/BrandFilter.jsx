import { Tag } from "lucide-react";

export default function BrandFilter({ brands, value, onChange }) {
  return (
    <div className="relative">
      <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-overlay/8 bg-base-900 py-2.5 pl-9 pr-8 text-sm text-base-100 transition focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
      >
        <option value="all">All Brands</option>
        {brands.map((brand) => (
          <option key={brand} value={brand} className="bg-base-900">
            {brand}
          </option>
        ))}
      </select>
    </div>
  );
}
