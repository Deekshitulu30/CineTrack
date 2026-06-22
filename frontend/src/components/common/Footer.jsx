import React from 'react';

export default function Footer() {
  return (
    <footer className="hidden md:block bg-surface-container-low/50 border-t border-outline-variant/20 py-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>movie</span>
          <span className="text-primary font-black text-lg tracking-tighter">CineTrack</span>
        </div>
        <p className="text-on-surface-variant text-sm">
          Powered by <span className="text-primary">TMDB</span> + <span className="text-tertiary">AI</span> · Built with ❤️ for cinephiles
        </p>
        <p className="text-on-surface-variant text-xs">
          © {new Date().getFullYear()} CineTrack
        </p>
      </div>
    </footer>
  );
}
