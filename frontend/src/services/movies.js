import api from './api';

export const discoverMovies = async (page = 1, genre = '') => {
  const params = { page };
  if (genre) params.genre = genre;
  const res = await api.get('/movies/discover', { params });
  return res.data;
};

export const searchMovies = async (query, page = 1) => {
  const res = await api.get('/movies/search', { params: { q: query, page } });
  return res.data;
};

export const getTrending = async (page = 1) => {
  const res = await api.get('/movies/trending', { params: { page } });
  return res.data;
};

export const getMoviesByActor = async (actorId, page = 1) => {
  const res = await api.get(`/movies/actor/${actorId}`, { params: { page } });
  return res.data;
};

export const getMoviesByGenre = async (genreId, page = 1) => {
  const res = await api.get(`/movies/genre/${genreId}`, { params: { page } });
  return res.data;
};

export const getMovieDetail = async (tmdbId) => {
  const res = await api.get(`/movies/${tmdbId}`);
  return res.data;
};

export const getSimilarMovies = async (tmdbId) => {
  const res = await api.get(`/movies/${tmdbId}/similar`);
  return res.data;
};

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

