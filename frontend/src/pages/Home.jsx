import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverMovies, getTrending, getMoviesByGenre } from '../services/movies';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../hooks/useAuth';
import MovieCard from '../components/common/MovieCard';
import AddToWatchlistModal from '../components/modals/AddToWatchlistModal';
import { TMDB_BACKDROP_BASE } from '../services/movies';
import toast from 'react-hot-toast';

// Horizontal shelf skeleton
function ShelfSkeleton({ count = 12 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="shrink-0 w-[150px] md:w-[185px]">
      <div className="aspect-[2/3] skeleton-shimmer rounded-xl" />
      <div className="mt-2 h-3 skeleton-shimmer rounded w-3/4" />
      <div className="mt-1 h-2 skeleton-shimmer rounded w-1/2" />
    </div>
  ));
}

// Reusable movie shelf row
function MovieShelf({ title, movies, loading, scrollRef, onScroll, onAdd, isInWatchlist }) {
  return (
    <section className="px-5 md:px-12 max-w-[1600px] mx-auto mt-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-on-surface font-bold text-xl md:text-2xl">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => onScroll(-1)}
            className="glass-panel p-2 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface text-[20px]">chevron_left</span>
          </button>
          <button onClick={() => onScroll(1)}
            className="glass-panel p-2 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
        {loading
          ? <ShelfSkeleton count={14} />
          : movies.map(movie => (
              <div key={movie.id} className="shrink-0 w-[150px] md:w-[185px] snap-start">
                <MovieCard movie={movie} showAddButton onAdd={onAdd} watchlistEntry={isInWatchlist(movie.id)} />
              </div>
            ))
        }
      </div>
    </section>
  );
}

const SHELVES = [
  { title: '🔥 Trending This Week',       key: 'trending',   fetch: () => getTrending(1) },
  { title: '💥 Action-Packed Thrills',    key: 'action',     fetch: () => getMoviesByGenre(28) },
  { title: '🚀 Futuristic & Sci-Fi',      key: 'scifi',      fetch: () => getMoviesByGenre(878) },
  { title: '😂 Laugh Out Loud Comedies',  key: 'comedy',     fetch: () => getMoviesByGenre(35) },
  { title: '💕 Romance & Love Stories',   key: 'romance',    fetch: () => getMoviesByGenre(10749) },
  { title: '🎭 Critically Acclaimed Drama',key: 'drama',     fetch: () => getMoviesByGenre(18) },
  { title: '👻 Horror & Suspense',        key: 'horror',     fetch: () => getMoviesByGenre(27) },
  { title: '🧙 Fantasy & Magical Worlds', key: 'fantasy',    fetch: () => getMoviesByGenre(14) },
  { title: '🎨 Animated Masterpieces',    key: 'animation',  fetch: () => getMoviesByGenre(16) },
  { title: '📜 History & Epic Stories',   key: 'history',    fetch: () => getMoviesByGenre(36) },
  { title: '🌍 Adventure & Exploration',  key: 'adventure',  fetch: () => getMoviesByGenre(12) },
  { title: '🕵️ Crime & Mystery Thrillers', key: 'crime',    fetch: () => getMoviesByGenre(80) },
];

export default function Home() {
  const [shelfMovies, setShelfMovies] = useState({});
  const [shelfLoading, setShelfLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [savingToWatchlist, setSavingToWatchlist] = useState(false);

  const { user } = useAuth();
  const { watchlist, fetchWatchlist, add, isInWatchlist } = useWatchlist();
  const navigate = useNavigate();

  // One ref per shelf
  const scrollRefs = useRef(SHELVES.map(() => React.createRef()));

  const heroMovies = shelfMovies['trending'] || [];
  const heroMovie  = heroMovies[heroIndex] || null;
  const backdropUrl = heroMovie?.backdrop_path ? `${TMDB_BACKDROP_BASE}${heroMovie.backdrop_path}` : null;

  useEffect(() => {
    fetchWatchlist();

    const BATCH_SIZE = 4; // load 4 shelves at a time to avoid hammering TMDB
    let mounted = true;

    async function loadShelves() {
      setShelfLoading(true);
      for (let i = 0; i < SHELVES.length; i += BATCH_SIZE) {
        const batch = SHELVES.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map(s => s.fetch()));
        if (!mounted) return;
        setShelfMovies(prev => {
          const updated = { ...prev };
          batch.forEach((shelf, idx) => {
            if (results[idx].status === 'fulfilled') {
              updated[shelf.key] = results[idx].value?.results?.slice(0, 20) || [];
            }
          });
          return updated;
        });
      }
      setShelfLoading(false);
    }

    loadShelves().catch(console.error);
    return () => { mounted = false; };
  }, [fetchWatchlist]);

  // Auto-advance hero every 6s
  useEffect(() => {
    if (!heroMovies.length) return;
    const interval = setInterval(() =>
      setHeroIndex(prev => (prev + 1) % Math.min(8, heroMovies.length)), 6000);
    return () => clearInterval(interval);
  }, [heroMovies]);

  const handleAdd = useCallback(async ({ status, user_rating }) => {
    if (!selectedMovie) return;
    setSavingToWatchlist(true);
    try {
      await add(selectedMovie.id, status, user_rating);
      setSelectedMovie(null);
    } catch {} finally { setSavingToWatchlist(false); }
  }, [selectedMovie, add]);

  const scroll = (ref, dir) => {
    if (ref?.current) ref.current.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">

      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <section className="relative h-[75vh] min-h-[520px] max-h-[820px] overflow-hidden">
        {backdropUrl ? (
          <div key={heroIndex}
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1326] to-[#1a2744]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 to-transparent" />

        <div className="relative h-full flex items-end pb-14 md:pb-20 px-5 md:px-12 max-w-[1600px] mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-secondary-container/80 text-on-secondary rounded-full px-3 py-1 mb-5 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_movies</span>
              <span className="text-xs font-bold uppercase tracking-wider">Featured Film</span>
            </div>

            {heroMovie ? (
              <>
                <h1 className="font-black text-on-surface mb-3 leading-tight"
                  style={{ fontSize: 'clamp(28px, 5.5vw, 64px)', letterSpacing: '-0.02em' }}>
                  {heroMovie.title}
                </h1>
                {heroMovie.release_date && (
                  <p className="text-primary text-sm font-bold mb-2">{heroMovie.release_date?.split('-')[0]}</p>
                )}
                <p className="text-on-surface-variant text-sm md:text-base line-clamp-3 mb-6 leading-relaxed max-w-lg">
                  {heroMovie.overview}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate(`/movie/${heroMovie.id}`)}
                    className="bg-primary text-on-primary font-bold px-8 py-3.5 rounded-full hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-primary/30 text-sm md:text-base">
                    <span className="material-symbols-outlined">play_circle</span>
                    View Details
                  </button>
                  {!isInWatchlist(heroMovie.id) ? (
                    <button onClick={() => setSelectedMovie(heroMovie)}
                      className="glass-panel text-on-surface font-semibold px-8 py-3.5 rounded-full hover:bg-surface-variant/50 transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base">
                      <span className="material-symbols-outlined">bookmark_add</span>
                      Add to Watchlist
                    </button>
                  ) : (
                    <div className="glass-panel text-tertiary font-semibold px-8 py-3.5 rounded-full flex items-center gap-2 text-sm md:text-base">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      In Watchlist
                    </div>
                  )}
                  <button onClick={() => navigate('/search')}
                    className="glass-panel text-on-surface-variant font-semibold px-6 py-3.5 rounded-full hover:text-on-surface transition-all flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[18px]">explore</span>
                    Explore All
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="h-14 skeleton-shimmer rounded-xl w-3/4" />
                <div className="h-4 skeleton-shimmer rounded w-1/2" />
                <div className="h-4 skeleton-shimmer rounded w-2/3" />
              </div>
            )}
          </div>
        </div>

        {/* Hero dot indicators */}
        {heroMovies.length > 1 && (
          <div className="absolute bottom-5 right-5 md:right-12 flex gap-1.5">
            {heroMovies.slice(0, 8).map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === heroIndex ? 'w-7 h-2 bg-primary' : 'w-2 h-2 bg-on-surface-variant/40 hover:bg-on-surface-variant/70'
                }`} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════ QUICK STATS (if logged in & has watchlist) ═══════════════════ */}
      {watchlist.length > 0 && (
        <section className="px-5 md:px-12 max-w-[1600px] mx-auto mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'movie', label: 'Total Saved',    value: watchlist.length,                                         color: 'text-primary',              bg: 'bg-primary/10' },
              { icon: 'check_circle', label: 'Watched', value: watchlist.filter(w => w.status === 'watched').length,     color: 'text-tertiary',             bg: 'bg-tertiary/10' },
              { icon: 'play_circle', label: 'Watching', value: watchlist.filter(w => w.status === 'watching').length,    color: 'text-secondary',            bg: 'bg-secondary/10' },
              { icon: 'bookmark', label: 'Plan to Watch', value: watchlist.filter(w => w.status === 'plan_to_watch').length, color: 'text-on-surface-variant', bg: 'bg-surface-variant/30' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${stat.color} text-[24px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div>
                  <p className={`${stat.color} font-black text-3xl leading-none`}>{stat.value}</p>
                  <p className="text-on-surface-variant text-sm mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ ALL MOVIE SHELVES ═══════════════════ */}
      {SHELVES.map((shelf, idx) => (
        <MovieShelf
          key={shelf.key}
          title={shelf.title}
          movies={shelfMovies[shelf.key] || []}
          loading={shelfLoading && !shelfMovies[shelf.key]}
          scrollRef={scrollRefs.current[idx]}
          onScroll={(dir) => scroll(scrollRefs.current[idx], dir)}
          onAdd={(m) => setSelectedMovie(m)}
          isInWatchlist={isInWatchlist}
        />
      ))}

      {/* ═══════════════════ EXPLORE CTA ═══════════════════ */}
      <section className="px-5 md:px-12 max-w-[1600px] mx-auto mt-16 mb-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
              explore
            </span>
            <h2 className="text-on-surface font-black text-2xl md:text-4xl mb-3" style={{ letterSpacing: '-0.02em' }}>
              Discover Every Movie Ever Made
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg mb-8 max-w-xl mx-auto">
              Browse our complete collection of films from 1900 to 2027. Hundreds of thousands of titles across every genre.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/search')}
                className="bg-primary text-on-primary font-bold px-10 py-4 rounded-full hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-primary/30 text-base">
                <span className="material-symbols-outlined">movie_filter</span>
                Browse All Movies
              </button>
              <button onClick={() => navigate('/search?genre=28')}
                className="glass-panel text-on-surface font-semibold px-10 py-4 rounded-full hover:bg-surface-variant/40 transition-all flex items-center gap-2 text-base">
                <span className="material-symbols-outlined">local_fire_department</span>
                Top Action Films
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Watchlist modal */}
      {selectedMovie && (
        <AddToWatchlistModal
          movie={selectedMovie}
          onSave={handleAdd}
          onClose={() => setSelectedMovie(null)}
          loading={savingToWatchlist}
        />
      )}
    </div>
  );
}
