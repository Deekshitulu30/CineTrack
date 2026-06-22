import React from 'react';

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden aspect-[2/3] skeleton-shimmer bg-surface-container-low">
          <div className="w-full h-full relative">
            <div className="absolute bottom-10 left-4 w-1/2 h-3 bg-surface-variant rounded opacity-50" />
            <div className="absolute bottom-4 left-4 w-3/4 h-4 bg-surface-variant rounded opacity-50" />
          </div>
        </div>
      ))}
    </>
  );
}
