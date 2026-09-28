import React from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ rating = 5, max = 5, size = 'sm', count, showNumber = true }) {
  const stars = [];
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = !isFilled && i - 0.5 <= rating;

    stars.push(
      <Star
        key={i}
        className={`${starSize} ${
          isFilled
            ? 'fill-amber-400 text-amber-400'
            : isHalf
            ? 'fill-amber-300/60 text-amber-400'
            : 'fill-stone-200 text-stone-300'
        }`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">{stars}</div>
      {showNumber && (
        <span className="text-xs font-semibold text-stone-800">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-stone-500">({count})</span>
      )}
    </div>
  );
}
