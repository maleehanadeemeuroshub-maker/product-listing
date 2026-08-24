import { Star, StarHalf } from "lucide-react";

export default function StarRating({ rating = 0, size = 14 }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return <Star key={i} size={size} className="fill-gold-400 text-gold-400" />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} size={size} className="fill-gold-400 text-gold-400" />;
        }
        return <Star key={i} size={size} className="text-base-600" />;
      })}
    </div>
  );
}
