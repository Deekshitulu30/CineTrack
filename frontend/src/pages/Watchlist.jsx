import React, { useEffect, useState, useCallback } from 'react';
import { TMDB_IMAGE_BASE } from '../services/movies';
import { useWatchlist } from '../hooks/useWatchlist';
import StatusBadge from '../components/common/StatusBadge';
import StarRating from '../components/common/StarRating';
import AddToWatchlistModal from '../components/modals/AddToWatchlistModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = [
  { value: '', label: 'All', icon: 'grid_view' },
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: 'bookmark' },
  { value: 'watching', label: 'Watching', icon: 'play_circle' },
  { value: 'watched', label: 'Watched', icon: 'check_circle' },
];

const SORTS = [
  { value: 'added_at', label: 'Recently Added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'user_rating', label: 'Highest Rated' },
];

export default function Watchlist() {
  const [activeTab, setActiveTab] = useState('');
  const [activeSort, setActiveSort] = useState('added_at');
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  const { watchlist, loading, fetchWatchlist, update, remove } = useWatchlist();

  useEffect(() => {
    fetchWatchlist(activeTab || undefined, activeSort);
  }, [activeTab, activeSort, fetchWatchlist]);

  const handleUpdate = useCallback(async (updates) => {
    if (!editingEntry) return;
    setSaving(true);
    try {
      await update(editingEntry.id, updates);
      setEditingEntry(null);
    } catch {}
    finally { setSaving(false); }
  }, [editingEntry, update]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Remove this movie from your watchlist?')) return;
    await remove(id);
  }, [remove]);

  const counts = {
    '': watchlist.length,
    plan_to_watch: watchlist.filter(w => w.status === 'plan_to_watch').length,
    watching: watchlist.filter(w => w.status === 'watching').length,
    watched: watchlist.filter(w => w.status === 'watched').length,
  };

  // Client-side filter for the counts display after initial fetch
  const displayed = activeTab
    ? watchlist.filter(w => w.status === activeTab)
    : watchlist;

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 md:pb-10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="font-black text-on-surface mb-2" style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.02em' }}>
              My Watchlist
            </h1>
            <p className="text-on-surface-variant">Manage and track your cinematic journey</p>
          </div>

          {/* Sort control */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={e => setActiveSort(e.target.value)}
              className="glass-input rounded-lg px-4 py-2 pr-8 text-sm appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px' }}
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="flex overflow-x-auto hide-scrollbar pb-4 mb-8 border-b border-outline-variant/30 gap-6 md:gap-8">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 pb-3 whitespace-nowrap font-bold transition-all duration-200 border-b-2 ${
                activeTab === tab.value
                  ? 'text-primary border-primary text-lg'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface text-base'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: activeTab === tab.value ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 font-bold ${activeTab === tab.value ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                {counts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-7xl mb-4 text-outline">video_library</span>
            <h2 className="text-xl font-bold mb-2">Your list is empty</h2>
            <p className="text-sm">Browse trending movies and add them to your watchlist</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {displayed.map(entry => {
              const posterUrl = entry.poster_path ? `${TMDB_IMAGE_BASE}${entry.poster_path}` : null;
              const year = entry.release_date ? new Date(entry.release_date).getFullYear() : '';
              let genres = [];
              try { genres = JSON.parse(entry.genres || '[]'); } catch {}

              return (
                <div key={entry.id} className="glass-panel rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 flex flex-col">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {posterUrl ? (
                      <img src={posterUrl} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-4xl">movie</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={entry.status} />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="bg-primary text-on-primary text-sm font-bold px-5 py-2 rounded-full w-3/4 hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-error mt-1 hover:bg-error/10 transition-colors p-2 rounded-full"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-on-surface font-semibold text-sm truncate mb-1">{entry.title}</h3>
                      <p className="text-on-surface-variant text-xs">{year}{genres[0] ? ` · ${genres[0]}` : ''}</p>
                    </div>
                    {entry.user_rating > 0 && (
                      <div className="mt-2">
                        <StarRating rating={entry.user_rating} readonly />
                      </div>
                    )}
                    {entry.status === 'watching' && (
                      <div className="mt-2 h-1 bg-surface-container-highest rounded-full">
                        <div className="h-1 bg-tertiary rounded-full w-2/5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <AddToWatchlistModal
          movie={{ ...editingEntry, id: editingEntry.tmdb_id, poster_path: editingEntry.poster_path }}
          existingEntry={editingEntry}
          onSave={handleUpdate}
          onClose={() => setEditingEntry(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
