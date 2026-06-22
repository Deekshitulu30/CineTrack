import api from './api';

export const getWatchlist = async (status, sort) => {
  const params = {};
  if (status) params.status = status;
  if (sort) params.sort = sort;
  const res = await api.get('/watchlist', { params });
  return res.data;
};

export const addToWatchlist = async (tmdb_id, status = 'plan_to_watch', user_rating) => {
  const res = await api.post('/watchlist', { tmdb_id, status, user_rating });
  return res.data;
};

export const updateWatchlist = async (id, updates) => {
  const res = await api.patch(`/watchlist/${id}`, updates);
  return res.data;
};

export const removeFromWatchlist = async (id) => {
  const res = await api.delete(`/watchlist/${id}`);
  return res.data;
};

export const getWatchlistStats = async () => {
  const res = await api.get('/watchlist/stats');
  return res.data;
};
