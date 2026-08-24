export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const isActive = category.slug === selected;
        return (
          <button
            key={category.slug}
            onClick={() => onSelect(category.slug)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition ${
              isActive
                ? "border-transparent bg-gradient-to-r from-accent-500 to-accent2-500 text-white shadow-md shadow-accent-500/20"
                : "border-overlay/8 bg-base-900 text-base-300 hover:border-overlay/20 hover:text-base-100"
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
