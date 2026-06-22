import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../../services/movies';

export default function MovieCard({ movie, showAddButton = false, onAdd, watchlistEntry, compact = false }) {
  const navigate = useNavigate();

  const posterUrl = movie?.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : null;

  const releaseYear = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const rating = movie?.vote_average ? parseFloat(movie.vote_average).toFixed(1) : null;

  const tmdbId = movie?.id || movie?.tmdb_id;

  const handleClick = () => {
    if (tmdbId) navigate(`/movie/${tmdbId}`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) onAdd(movie);
  };

  return (
    <div
      onClick={handleClick}
      className="movie-card group relative rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 bg-surface-container-low"
    >
      {/* Poster */}
      <div className="aspect-[2/3] w-full relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie?.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl">movie</span>
            <span className="text-on-surface-variant text-xs text-center px-2 line-clamp-2">{movie?.title}</span>
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 glass-panel px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-[11px] font-bold text-on-surface tracking-wide">{rating}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-100 group-hover:opacity-80 transition-opacity" />

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center px-3">
            <p className="text-on-surface text-xs font-semibold">View Details</p>
          </div>
          {showAddButton && !watchlistEntry && (
            <button
              onClick={handleAdd}
              className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-primary-fixed transition-colors mt-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add
            </button>
          )}
          {watchlistEntry && (
            <div className="bg-tertiary-container/80 text-on-tertiary text-[10px] font-bold px-2 py-1 rounded-full">
              ✓ In List
            </div>
          )}
        </div>

        {/* Title overlay (always visible at bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-3">
          {releaseYear && (
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase mb-0.5">{releaseYear}</p>
          )}
          <h3 className="text-sm font-semibold text-on-background line-clamp-2 leading-tight">
            {movie?.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
