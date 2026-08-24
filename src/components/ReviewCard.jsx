import StarRating from "./StarRating";
import UserAvatar from "./UserAvatar";

export default function ReviewCard({ review }) {
  return (
    <div className="flex gap-3 rounded-xl border border-overlay/8 bg-base-900 p-4">
      <UserAvatar name={review.reviewerName} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-sm font-semibold text-base-100">{review.reviewerName}</span>
          <span className="text-xs text-base-400">
            {new Date(review.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
          </span>
        </div>
        <StarRating rating={review.rating} size={13} />
        <p className="mt-2 text-sm text-base-300">{review.comment}</p>
      </div>
    </div>
  );
}
