import React, { useState, useCallback } from 'react';
import { getRecommendations } from '../services/recommendations';
import { addToWatchlist } from '../services/watchlist';
import { TMDB_IMAGE_BASE } from '../services/movies';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const MOOD_CHIPS = [
  { value: 'any', label: 'Surprise Me', icon: 'shuffle', gradient: 'from-primary/30 to-secondary/30' },
  { value: 'Action and Adventure', label: 'Action', icon: 'sports_martial_arts', gradient: 'from-error/30 to-secondary/30' },
  { value: 'Comedy', label: 'Comedy', icon: 'sentiment_very_satisfied', gradient: 'from-secondary/40 to-tertiary/30' },
  { value: 'Drama', label: 'Drama', icon: 'theater_comedy', gradient: 'from-primary/30 to-tertiary/20' },
  { value: 'Horror', label: 'Horror', icon: 'skull', gradient: 'from-error/40 to-surface-variant/40' },
  { value: 'Sci-Fi', label: 'Sci-Fi', icon: 'rocket_launch', gradient: 'from-tertiary/30 to-primary/30' },
  { value: 'Romance', label: 'Romance', icon: 'favorite', gradient: 'from-error/30 to-primary/30' },
  { value: 'Thriller', label: 'Thriller', icon: 'visibility', gradient: 'from-secondary-container/50 to-surface-variant/30' },
  { value: 'Documentary', label: 'Documentary', icon: 'local_library', gradient: 'from-tertiary-container/40 to-primary/20' },
  { value: 'Animation', label: 'Animation', icon: 'animation', gradient: 'from-primary-container/40 to-secondary/30' },
];

export default function Recommendations() {
  const [selectedMood, setSelectedMood] = useState('any');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingIds, setAddingIds] = useState(new Set());

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);
    try {
      const data = await getRecommendations(selectedMood);
      setRecommendations(data.recommendations || []);
      if (!data.recommendations?.length) {
        setError('No recommendations found. Try a different mood!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get recommendations. Make sure Ollama is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedMood]);

  const handleAddToWatchlist = async (movie) => {
    setAddingIds(prev => new Set([...prev, movie.id]));
    try {
      await addToWatchlist(movie.id, 'plan_to_watch');
      toast.success(`"${movie.title}" added to your watchlist!`);
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Already in your watchlist', { icon: '👀' });
      } else {
        toast.error('Failed to add to watchlist');
      }
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(movie.id); return n; });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 md:pb-10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-tertiary/10 border border-tertiary/30 rounded-full px-4 py-2 mb-4">
            <span className="material-symbols-outlined text-tertiary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-tertiary text-sm font-bold uppercase tracking-wider">Powered by AI</span>
          </div>
          <h1 className="font-black text-on-surface mb-3" style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.02em' }}>
            AI Recommendations
          </h1>
          <p className="text-on-surface-variant text-base max-w-xl">
            Our local AI analyzes your watchlist and suggests movies tailored to your taste and mood.
          </p>
        </div>

        {/* Mood Selector */}
        <section className="mb-10">
          <h2 className="text-on-surface font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>mood</span>
            What are you in the mood for?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MOOD_CHIPS.map(mood => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  selectedMood === mood.value
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                    : 'border-outline-variant/30 glass-panel text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
                }`}
              >
                {selectedMood === mood.value && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-30`} />
                )}
                <span
                  className="material-symbols-outlined text-2xl z-10 relative"
                  style={{ fontVariationSettings: selectedMood === mood.value ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {mood.icon}
                </span>
                <span className="text-xs font-bold z-10 relative">{mood.label}</span>
                {selectedMood === mood.value && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[10px]">check</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Generate Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary text-on-primary font-bold text-base px-10 py-4 rounded-full hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-primary/30 disabled:opacity-60 ai-glow-border"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>AI is thinking...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Generate Recommendations
              </>
            )}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <p className="text-on-surface font-semibold text-lg mb-1">Analyzing your taste...</p>
            <p className="text-on-surface-variant text-sm">This may take up to 30 seconds for local AI</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-panel rounded-2xl p-8 text-center border border-error/20 max-w-lg mx-auto">
            <span className="material-symbols-outlined text-error text-4xl mb-3 block">error_outline</span>
            <p className="text-error font-semibold mb-2">Something went wrong</p>
            <p className="text-on-surface-variant text-sm">{error}</p>
            <div className="mt-4 text-left bg-surface-container-high rounded-xl p-4 text-xs text-on-surface-variant space-y-1">
              <p className="font-bold text-on-surface mb-2">Ollama Setup:</p>
              <p>1. Download from <span className="text-primary">ollama.com/download</span></p>
              <p>2. Run: <code className="bg-surface-container px-1 py-0.5 rounded text-tertiary">ollama pull llama3</code></p>
              <p>3. Add movies to your watchlist first</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {recommendations.length > 0 && !loading && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h2 className="text-on-surface font-bold text-xl">
                {recommendations.length} picks for your{' '}
                <span className="text-tertiary">{MOOD_CHIPS.find(m => m.value === selectedMood)?.label}</span> mood
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {recommendations.map((movie, i) => {
                const posterUrl = movie?.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null;
                const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
                const isAdding = addingIds.has(movie.id);

                return (
                  <div key={movie.id || i} className="glass-panel rounded-xl overflow-hidden flex flex-col group hover:scale-[1.02] transition-transform duration-300">
                    {/* AI tag */}
                    <div className="relative aspect-[2/3]">
                      {posterUrl ? (
                        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant">movie</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-tertiary-container/90 text-on-tertiary-container backdrop-blur-md px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Pick</span>
                      </div>
                      {movie.vote_average > 0 && (
                        <div className="absolute top-2 right-2 glass-panel px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <span className="material-symbols-outlined text-secondary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-[11px] font-bold text-on-surface">{parseFloat(movie.vote_average).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Info + Add button */}
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-on-surface font-semibold text-sm mb-1 line-clamp-2 leading-tight">{movie.title}</h3>
                        <p className="text-on-surface-variant text-xs">{year}</p>
                      </div>
                      <button
                        onClick={() => handleAddToWatchlist(movie)}
                        disabled={isAdding}
                        className="mt-3 w-full bg-primary/10 hover:bg-primary hover:text-on-primary border border-primary/30 text-primary text-xs font-bold py-2 rounded-full transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isAdding ? <LoadingSpinner size="sm" /> : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Add to Watchlist
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state initial */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <p className="text-lg font-semibold mb-2 text-on-surface">Ready to discover?</p>
            <p className="text-sm max-w-sm mx-auto">Select your mood above and click "Generate Recommendations" to get AI-curated movie suggestions based on your watchlist</p>
          </div>
        )}
      </div>
    </div>
  );
}
