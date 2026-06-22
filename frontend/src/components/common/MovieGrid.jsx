import React from 'react';
import MovieCard from './MovieCard';

export default function MovieGrid({ movies, showAddButton, onAdd, watchlistItems = [], loading, emptyMessage = 'No movies found' }) {
  if (!movies?.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl mb-4 text-outline">movie_filter</span>
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {movies?.map(movie => {
        const tmdbId = movie?.id || movie?.tmdb_id;
        const watchlistEntry = watchlistItems.find(w => w.tmdb_id === tmdbId);
        return (
          <MovieCard
            key={tmdbId}
            movie={movie}
            showAddButton={showAddButton}
            onAdd={onAdd}
            watchlistEntry={watchlistEntry}
          />
        );
      })}
    </div>
  );
}
