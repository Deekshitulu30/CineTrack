import React from 'react';

const STATUS_CONFIG = {
  plan_to_watch: {
    label: 'Plan to Watch',
    className: 'bg-secondary-container/80 text-on-secondary border border-secondary/30',
  },
  watching: {
    label: 'Watching',
    className: 'bg-tertiary-container/80 text-on-tertiary-container border border-tertiary/30',
  },
  watched: {
    label: 'Watched',
    className: 'bg-tertiary/20 text-tertiary border border-tertiary/40',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-surface-variant text-on-surface-variant border border-outline-variant' };

  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-widest rounded-full backdrop-blur-md ${config.className} ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
    }`}>
      {config.label}
    </span>
  );
}
