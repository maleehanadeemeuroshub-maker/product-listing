import React from 'react';

export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-3xl glass-panel border border-white/5 p-5 space-y-4 animate-pulse overflow-hidden"
        >
          {/* Top Tag & Stock */}
          <div className="flex justify-between items-center">
            <div className="h-4 w-16 bg-slate-800/80 rounded-md" />
            <div className="h-4 w-14 bg-slate-800/80 rounded-md" />
          </div>

          {/* Thumbnail Image Shimmer */}
          <div className="w-full h-48 rounded-2xl bg-slate-800/70" />

          {/* Category & Title */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-800/60 rounded" />
            <div className="h-5 w-4/5 bg-slate-800/80 rounded" />
          </div>

          {/* Rating */}
          <div className="h-3.5 w-24 bg-slate-800/60 rounded" />

          {/* Price & Action Button */}
          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            <div className="h-6 w-16 bg-slate-800/80 rounded" />
            <div className="h-8 w-20 bg-slate-800/80 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
