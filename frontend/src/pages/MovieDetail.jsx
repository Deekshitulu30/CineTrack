import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetail, getSimilarMovies, TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from '../services/movies';
import { addToWatchlist } from '../services/watchlist';
import { useWatchlist } from '../hooks/useWatchlist';
import AddToWatchlistModal from '../components/modals/AddToWatchlistModal';
import StarRating from '../components/common/StarRating';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MovieCard from '../components/common/MovieCard';
import toast from 'react-hot-toast';

export default function MovieDetail() {
  const { tmdbId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [savingToWatchlist, setSavingToWatchlist] = useState(false);
  const { watchlist, fetchWatchlist, add, update, isInWatchlist } = useWatchlist();

  useEffect(() => {
    setLoading(true);
    getMovieDetail(tmdbId)
      .then(data => setMovie(data))
      .catch(() => toast.error('Movie not found'))
      .finally(() => setLoading(false));

    getSimilarMovies(tmdbId)
      .then(data => setSimilar(data.results?.slice(0, 8) || []))
      .catch(() => {});

    fetchWatchlist();
  }, [tmdbId, fetchWatchlist]);

  const watchlistEntry = movie ? isInWatchlist(movie.id) : null;

  const handleSave = async ({ status, user_rating, review_text }) => {
    setSavingToWatchlist(true);
    try {
      if (watchlistEntry) {
        await update(watchlistEntry.id, { status, user_rating, review_text });
      } else {
        await add(movie.id, status, user_rating);
      }
      setShowModal(false);
    } catch {}
    finally { setSavingToWatchlist(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl block mb-4">movie_off</span>
          <p>Movie not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const genres = movie.genres || [];
  const cast = movie.credits?.cast?.slice(0, 6) || [];
  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const runtimeHrs = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const runtimeMins = movie.runtime ? movie.runtime % 60 : 0;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ BACKDROP HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative w-full h-[60vh] md:h-[70vh] max-h-[700px]">
        {backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : <div className="absolute inset-0 bg-surface-container-low" />}

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-28 md:top-24 left-5 md:left-16 z-20 glass-panel p-2 rounded-full hover:bg-surface-variant/60 transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>

        {/* Content */}
        <div className="relative h-full flex items-end z-10 max-w-[1440px] mx-auto px-5 md:px-16 pb-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full items-end md:items-end">
            {/* Poster (desktop) */}
            {posterUrl && (
              <div className="hidden md:block w-52 xl:w-64 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border border-outline-variant/30 translate-y-12">
                <img src={posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
              </div>
            )}

            {/* Details */}
            <div className="flex-1 space-y-4 md:translate-y-4">
              {/* Mobile poster absolute */}
              {posterUrl && (
                <div className="md:hidden absolute left-5 bottom-0 w-28 rounded-xl overflow-hidden shadow-xl border border-outline-variant/30 translate-y-8">
                  <img src={posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                </div>
              )}

              <div className="md:block" style={{ marginLeft: posterUrl ? '0' : '0' }}>
                <h1 className="font-black text-on-surface leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 48px)', letterSpacing: '-0.02em' }}>
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-on-surface-variant italic mt-1 text-base">"{movie.tagline}"</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-on-surface-variant text-sm">
                {year && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>{year}
                  </span>
                )}
                {movie.runtime > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {runtimeHrs > 0 ? `${runtimeHrs}h ` : ''}{runtimeMins}m
                    </span>
                  </>
                )}
                {movie.vote_average > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="flex items-center gap-1 text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {parseFloat(movie.vote_average).toFixed(1)}/10
                    </span>
                  </>
                )}
                {genres.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant hidden md:block" />
                    <div className="flex flex-wrap gap-1.5">
                      {genres.slice(0, 3).map(g => (
                        <span key={g.id} className="px-2.5 py-0.5 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-xs font-semibold">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => setShowModal(true)}
                  className={`flex items-center gap-2 font-bold px-6 py-3 rounded-full transition-all active:scale-95 shadow-lg text-sm ${
                    watchlistEntry
                      ? 'bg-tertiary-container/80 text-on-tertiary-container hover:bg-tertiary-container'
                      : 'bg-primary text-on-primary hover:bg-primary-fixed shadow-primary/30'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: watchlistEntry ? "'FILL' 1" : "'FILL' 0" }}>
                    {watchlistEntry ? 'bookmark_added' : 'add'}
                  </span>
                  {watchlistEntry ? 'In Watchlist' : 'Add to Watchlist'}
                </button>

                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel flex items-center gap-2 font-semibold px-6 py-3 rounded-full hover:bg-surface-variant/60 transition-all active:scale-95 text-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-error">play_circle</span>
                    Trailer
                  </a>
                )}
              </div>

              {/* Status badge if in watchlist */}
              {watchlistEntry && (
                <div className="flex items-center gap-2 ml-1">
                  <StatusBadge status={watchlistEntry.status} size="md" />
                  {watchlistEntry.user_rating > 0 && (
                    <StarRating rating={watchlistEntry.user_rating} readonly />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ DETAILS BELOW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 mt-28 md:mt-20 space-y-12 pb-8">
        {/* Overview */}
        {movie.overview && (
          <section className="max-w-4xl">
            <h2 className="text-on-surface font-bold text-xl mb-4">Overview</h2>
            <p className="text-on-surface-variant leading-relaxed text-base">{movie.overview}</p>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-on-surface font-bold text-xl mb-5">Top Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {cast.map(person => (
                <div
                  key={person.id}
                  onClick={() => navigate(`/search?actorId=${person.id}&actorName=${encodeURIComponent(person.name)}&page=1`)}
                  className="glass-panel rounded-xl p-3 flex items-center gap-3 hover:bg-surface-container-high/40 border hover:border-primary/40 cursor-pointer transition-all duration-200"
                >
                  {person.profile_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${person.profile_path}`}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-on-surface font-semibold text-xs truncate">{person.name}</p>
                    <p className="text-on-surface-variant text-[11px] truncate">as {person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <hr className="border-outline-variant/20" />

        {/* Similar Movies */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-on-surface font-bold text-xl mb-5">Similar Movies</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
              {similar.map(m => (
                <div key={m.id} className="shrink-0 w-[150px] md:w-[180px] snap-start">
                  <MovieCard movie={m} showAddButton onAdd={() => {}} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <AddToWatchlistModal
          movie={movie}
          existingEntry={watchlistEntry || null}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          loading={savingToWatchlist}
        />
      )}
    </div>
  );
}
