import React from 'react';

export default function StarRating({ rating = 0, onChange, readonly = false, maxStars = 5 }) {
  // rating is 1-10, stars are 1-5 (each star = 2 points)
  const starValue = rating ? Math.round(rating / 2) : 0;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < starValue;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange((i + 1) * 2)}
            className={`transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125 active:scale-95'
            }`}
          >
            <span
              className={`material-symbols-outlined ${filled ? 'text-secondary' : 'text-on-surface-variant/30'}`}
              style={{
                fontSize: '18px',
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-secondary text-xs font-bold">{rating}/10</span>
      )}
    </div>
  );
}
