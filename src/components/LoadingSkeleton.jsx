function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-overlay/8 bg-base-900">
      <div className="skeleton-shimmer aspect-square w-full" />
      <div className="flex flex-col gap-3 p-4">
        <div className="skeleton-shimmer h-3 w-1/3 rounded-full" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded-full" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
        <div className="skeleton-shimmer h-5 w-1/3 rounded-full" />
        <div className="skeleton-shimmer mt-1 h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
