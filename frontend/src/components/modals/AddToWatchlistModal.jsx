import React, { useState, useEffect } from 'react';
import { TMDB_IMAGE_BASE } from '../../services/movies';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';

const STATUS_OPTIONS = [
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: 'bookmark', color: 'text-secondary' },
  { value: 'watching', label: 'Watching', icon: 'play_circle', color: 'text-tertiary' },
  { value: 'watched', label: 'Watched', icon: 'check_circle', color: 'text-primary' },
];

export default function AddToWatchlistModal({ movie, existingEntry, onSave, onClose, loading = false }) {
  const [status, setStatus] = useState(existingEntry?.status || 'plan_to_watch');
  const [rating, setRating] = useState(existingEntry?.user_rating || 0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (existingEntry) {
      setStatus(existingEntry.status);
      setRating(existingEntry.user_rating || 0);
    }
  }, [existingEntry]);

  const posterUrl = movie?.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null;
  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';

  const handleSave = () => {
    onSave({ status, user_rating: rating || null, review_text: reviewText || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/20">
        {/* Top glow line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-outline-variant/20">
          {posterUrl ? (
            <img src={posterUrl} alt={movie?.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0 shadow-lg" />
          ) : (
            <div className="w-14 h-20 bg-surface-container-high rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant">movie</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-on-surface font-bold text-lg leading-tight line-clamp-2">{movie?.title}</h2>
            {releaseYear && <p className="text-on-surface-variant text-sm mt-1">{releaseYear}</p>}
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Status Selector */}
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-3">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                    status === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/30 bg-surface-container/40 text-on-surface-variant hover:border-primary/40 hover:bg-surface-variant/30'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${status === opt.value ? 'text-primary' : opt.color}`}
                    style={{ fontVariationSettings: status === opt.value ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {opt.icon}
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-center">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-3">Your Rating</p>
            <StarRating rating={rating} onChange={setRating} readonly={false} />
            {rating > 0 && (
              <button
                type="button"
                onClick={() => setRating(0)}
                className="mt-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Clear rating
              </button>
            )}
          </div>

          {/* Review */}
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-3">Review (Optional)</p>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-variant/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-fixed transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? <LoadingSpinner size="sm" /> : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                {existingEntry ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
