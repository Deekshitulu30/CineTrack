import { useState, useCallback } from 'react';
import { getWatchlist, addToWatchlist, updateWatchlist, removeFromWatchlist } from '../services/watchlist';
import toast from 'react-hot-toast';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async (status, sort) => {
    setLoading(true);
    try {
      const data = await getWatchlist(status, sort);
      setWatchlist(data.entries || []);
    } catch (err) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (tmdb_id, status, user_rating) => {
    try {
      const data = await addToWatchlist(tmdb_id, status, user_rating);
      setWatchlist(prev => [data.entry, ...prev]);
      toast.success('Added to watchlist!');
      return data;
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Already in your watchlist');
      } else {
        toast.error('Failed to add to watchlist');
      }
      throw err;
    }
  }, []);

  const update = useCallback(async (id, updates) => {
    try {
      const data = await updateWatchlist(id, updates);
      setWatchlist(prev => prev.map(item => item.id === id ? data.entry : item));
      toast.success('Watchlist updated!');
      return data;
    } catch {
      toast.error('Failed to update');
      throw new Error('Failed to update');
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await removeFromWatchlist(id);
      setWatchlist(prev => prev.filter(item => item.id !== id));
      toast.success('Removed from watchlist');
    } catch {
      toast.error('Failed to remove');
    }
  }, []);

  const isInWatchlist = useCallback((tmdbId) => {
    return watchlist.find(item => item.tmdb_id === tmdbId);
  }, [watchlist]);

  return { watchlist, loading, fetchWatchlist, add, update, remove, isInWatchlist };
}
