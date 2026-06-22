import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies, discoverMovies, getMoviesByActor } from '../services/movies';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieCard from '../components/common/MovieCard';
import SkeletonCard from '../components/common/SkeletonCard';
import AddToWatchlistModal from '../components/modals/AddToWatchlistModal';
import toast from 'react-hot-toast';

const GENRES = [
  { id: '', label: '🌐 All Genres' },
  { id: '28', label: '💥 Action' },
  { id: '35', label: '😂 Comedy' },
  { id: '18', label: '🎭 Drama' },
  { id: '27', label: '👻 Horror' },
  { id: '878', label: '🚀 Sci-Fi' },
  { id: '10749', label: '💕 Romance' },
  { id: '53', label: '🔪 Thriller' },
  { id: '16', label: '🎨 Animation' },
  { id: '99', label: '🎥 Documentary' },
  { id: '12', label: '🌍 Adventure' },
  { id: '14', label: '🧙 Fantasy' },
  { id: '80', label: '🕵️ Crime' },
  { id: '9648', label: '🔍 Mystery' },
  { id: '36', label: '📜 History' },
  { id: '10752', label: '⚔️ War' },
  { id: '37', label: '🤠 Western' },
];

// Max pages cap — TMDB discover can return hundreds of pages
const MAX_PAGES = 500;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [savingToWatchlist, setSavingToWatchlist] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const { fetchWatchlist, add, isInWatchlist } = useWatchlist();

  const pageParam = parseInt(searchParams.get('page')) || 1;
  const actorId   = searchParams.get('actorId')   || '';
  const actorName = searchParams.get('actorName') || '';

  /* ── Data fetchers ─────────────────────────────────────────────── */
  const doSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await searchMovies(q, p);
      setResults(data.results || []);
      setTotalPages(Math.min(MAX_PAGES, data.total_pages || 1));
      setTotalResults(data.total_results || 0);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDiscover = useCallback(async (p = 1, genre = '') => {
    setLoading(true);
    try {
      const data = await discoverMovies(p, genre);
      setResults(data.results || []);
      setTotalPages(Math.min(MAX_PAGES, data.total_pages || 1));
      setTotalResults(data.total_results || 0);
    } catch {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActorMovies = useCallback(async (id, p = 1) => {
    setLoading(true);
    try {
      const data = await getMoviesByActor(id, p);
      setResults(data.results || []);
      setTotalPages(Math.min(MAX_PAGES, data.total_pages || 1));
      setTotalResults(data.total_results || 0);
    } catch {
      toast.error('Failed to load actor movies');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Effect: reload on URL param change ────────────────────────── */
  useEffect(() => {
    fetchWatchlist();
    const q      = searchParams.get('q');
    const actId  = searchParams.get('actorId');
    const genre  = searchParams.get('genre') || '';
    const p      = parseInt(searchParams.get('page')) || 1;
    setSelectedGenre(genre);

    if (actId) {
      loadActorMovies(actId, p);
    } else if (q) {
      setQuery(q);
      doSearch(q, p);
    } else {
      loadDiscover(p, genre);
    }
  }, [searchParams, doSearch, loadDiscover, loadActorMovies, fetchWatchlist]);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim(), page: 1 });
    } else {
      setSearchParams({ page: 1, ...(selectedGenre ? { genre: selectedGenre } : {}) });
    }
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
    setQuery('');
    setSearchParams({ page: 1, ...(genreId ? { genre: genreId } : {}) });
  };

  const handleAdd = async ({ status, user_rating }) => {
    if (!selectedMovie) return;
    setSavingToWatchlist(true);
    try {
      await add(selectedMovie.id, status, user_rating);
      setSelectedMovie(null);
    } catch {} finally { setSavingToWatchlist(false); }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const q      = searchParams.get('q');
    const actId  = searchParams.get('actorId');
    const actNm  = searchParams.get('actorName');
    const genre  = searchParams.get('genre') || '';
    const params = {};
    if (actId) { params.actorId = actId; params.actorName = actNm; }
    else if (q) { params.q = q; }
    if (genre) params.genre = genre;
    params.page = newPage;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Pagination helper ─────────────────────────────────────────── */
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages around current
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, pageParam - delta);
      const end   = Math.min(totalPages - 1, pageParam + delta);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const isSearchMode = !!searchParams.get('q');
  const pageTitle  = actorName ? 'Filmography' : isSearchMode ? 'Search Results' : 'Discover';
  const pageSubtitle = actorName
    ? `Movies starring ${actorName}`
    : isSearchMode
    ? `Results from 1900 – 2027`
    : `Browse all movies from 1900 – 2027 · ${totalResults.toLocaleString()} titles`;

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 md:pb-10">
      <div className="max-w-[1600px] mx-auto px-5 md:px-12">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="font-black text-gradient-primary mb-2" style={{ fontSize: 'clamp(32px, 6vw, 56px)', letterSpacing: '-0.02em' }}>
            {pageTitle}
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base">{pageSubtitle}</p>
        </div>

        {/* ── Search Bar (hidden in actor mode) ── */}
        {!actorId && (
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-3xl glass-panel rounded-full overflow-hidden flex items-center p-2 border-primary/20 focus-within:border-primary/60 transition-colors duration-300">
              <span className="material-symbols-outlined ml-4 text-outline text-[22px]">search</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search 1900–2027 movies, actors, directors..."
                className="w-full bg-transparent border-none text-on-surface focus:ring-0 outline-none text-base px-4 py-3 placeholder:text-outline-variant"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSearchParams({ page: 1 }); }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors mr-2">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
              <button type="submit"
                className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full hover:bg-primary-fixed transition-colors text-sm flex-shrink-0">
                Search
              </button>
            </div>
          </form>
        )}

        {/* ── Actor back link ── */}
        {actorId && (
          <div className="mb-6">
            <button onClick={() => setSearchParams({ page: 1 })}
              className="flex items-center gap-2 text-primary font-semibold hover:underline">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Discover
            </button>
          </div>
        )}

        {/* ── Genre filter chips ── */}
        {!actorId && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-6">
            {GENRES.map(g => (
              <button key={g.id} onClick={() => handleGenreClick(g.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedGenre === g.id
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 scale-105'
                    : 'glass-panel text-on-surface-variant hover:text-on-surface hover:border-primary/40'
                }`}>
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Results info bar ── */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <p className="text-on-surface-variant text-sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                Loading movies...
              </span>
            ) : results.length > 0 ? (
              <span>
                <span className="text-on-surface font-semibold">{results.length}</span>
                {' '}movies shown
                {totalResults > 0 && <span className="text-outline-variant ml-1">({totalResults.toLocaleString()} total)</span>}
                <span className="text-outline-variant ml-2">· Page {pageParam} of {totalPages.toLocaleString()}</span>
              </span>
            ) : 'No movies found'}
          </p>
          {!loading && totalPages > 1 && (
            <span className="text-outline-variant text-xs glass-panel px-3 py-1 rounded-full">
              ~{(totalResults).toLocaleString()} movies across {totalPages.toLocaleString()} pages
            </span>
          )}
        </div>

        {/* ── Movie Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            <SkeletonCard count={36} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {results.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  showAddButton
                  onAdd={(m) => setSelectedMovie(m)}
                  watchlistEntry={isInWatchlist(movie.id)}
                />
              ))}
              {results.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl mb-4 text-outline">search_off</span>
                  <p className="text-lg font-medium">No movies found</p>
                  <p className="text-sm mt-1">Try a different search term or genre</p>
                </div>
              )}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12 pb-6 flex-wrap">
                <button onClick={() => handlePageChange(1)} disabled={pageParam === 1}
                  className="px-3 py-2 rounded-full text-xs font-bold glass-panel text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  «
                </button>
                <button onClick={() => handlePageChange(pageParam - 1)} disabled={pageParam === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm glass-panel text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Prev
                </button>

                {getPageNumbers().map((p, idx) => {
                  if (p === '...') return (
                    <span key={`dots-${idx}`} className="text-on-surface-variant/40 px-1 select-none font-bold">…</span>
                  );
                  return (
                    <button key={p} onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                        p === pageParam
                          ? 'bg-primary text-on-primary shadow-lg shadow-primary/25 scale-110'
                          : 'glass-panel text-on-surface-variant hover:text-on-surface hover:border-primary/30'
                      }`}>
                      {p}
                    </button>
                  );
                })}

                <button onClick={() => handlePageChange(pageParam + 1)} disabled={pageParam === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm glass-panel text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  Next
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={pageParam === totalPages}
                  className="px-3 py-2 rounded-full text-xs font-bold glass-panel text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors">
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
