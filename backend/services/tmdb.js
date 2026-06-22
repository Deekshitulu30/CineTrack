const axios = require('axios');
const { query } = require('../db');

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_KEY  = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

const DATE_FROM = '1900-01-01';
const DATE_TO   = '2027-12-31';

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: TMDB_KEY },
  timeout: 12000
});

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

/* ── Cache helpers ─────────────────────────────────────────────────── */
async function cacheMovie(m) {
  if (!m || !m.id) return;
  let genreNames = [];
  if (Array.isArray(m.genres)) {
    genreNames = m.genres.map(g => (typeof g === 'object' && g ? g.name : g)).filter(Boolean);
  } else if (Array.isArray(m.genre_ids)) {
    genreNames = m.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean);
  }
  const genres = JSON.stringify(genreNames);

  await query(`
    INSERT INTO movies
      (tmdb_id, title, overview, poster_path, backdrop_path,
       release_date, vote_average, vote_count, genres, runtime)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (tmdb_id) DO UPDATE SET
      title         = EXCLUDED.title,
      overview      = EXCLUDED.overview,
      poster_path   = EXCLUDED.poster_path,
      backdrop_path = EXCLUDED.backdrop_path,
      release_date  = EXCLUDED.release_date,
      vote_average  = EXCLUDED.vote_average,
      vote_count    = EXCLUDED.vote_count,
      genres        = EXCLUDED.genres,
      runtime       = COALESCE(EXCLUDED.runtime, movies.runtime)
  `, [
    m.id, m.title, m.overview, m.poster_path, m.backdrop_path,
    m.release_date, m.vote_average, m.vote_count, genres, m.runtime || null
  ]);
}

async function cacheMovies(list) {
  if (!Array.isArray(list)) return;
  for (const m of list) {
    try { await cacheMovie(m); } catch { /* skip individual errors */ }
  }
}

/* ── Double-page helper ────────────────────────────────────────────── */
// frontendPage 1 → TMDB pages 1 & 2 (up to 40 results), page 2 → 3 & 4, …
async function fetchDoublePage(fetchFn, frontendPage) {
  const t1 = (frontendPage - 1) * 2 + 1;
  const t2 = t1 + 1;
  const [r1, r2] = await Promise.all([
    fetchFn(t1).catch(() => null),
    fetchFn(t2).catch(() => null),
  ]);
  const combined = [...(r1?.results || []), ...(r2?.results || [])];
  const seen = new Set();
  const unique = combined.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
  await cacheMovies(unique);
  const totalTmdb = r1?.total_pages || 1;
  return {
    page: frontendPage,
    results: unique,
    total_pages: Math.min(500, Math.ceil(totalTmdb / 2)),
    total_results: r1?.total_results || unique.length,
  };
}

/* ── Public API functions ──────────────────────────────────────────── */
async function discoverMovies(frontendPage = 1, extraParams = {}) {
  const base = {
    sort_by: 'popularity.desc',
    'primary_release_date.gte': DATE_FROM,
    'primary_release_date.lte': DATE_TO,
    'vote_count.gte': 5,
    include_adult: false,
    ...extraParams
  };
  return fetchDoublePage(p => tmdb.get('/discover/movie', { params: { ...base, page: p } }).then(r => r.data), frontendPage);
}

async function searchMovies(query, frontendPage = 1) {
  return fetchDoublePage(p => tmdb.get('/search/movie', {
    params: { query, page: p, 'primary_release_date.gte': DATE_FROM, 'primary_release_date.lte': DATE_TO }
  }).then(r => r.data), frontendPage);
}

async function getTrending(frontendPage = 1) {
  const data = await fetchDoublePage(
    p => tmdb.get('/trending/movie/week', { params: { page: p } }).then(r => r.data),
    frontendPage
  );
  data.results = (data.results || []).filter(m => {
    const y = parseInt((m.release_date || '').split('-')[0]);
    return y >= 1900 && y <= 2027;
  });
  return data;
}

async function getMovieDetail(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}`, { params: { append_to_response: 'credits,videos' } });
  return res.data;
}

async function getSimilar(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}/similar`);
  if (res.data?.results) await cacheMovies(res.data.results);
  return res.data;
}

async function getMoviesByGenre(genreId, frontendPage = 1) {
  return discoverMovies(frontendPage, { with_genres: genreId });
}

async function getMoviesByActor(actorId, frontendPage = 1) {
  return fetchDoublePage(p => tmdb.get('/discover/movie', {
    params: {
      with_cast: actorId, page: p, sort_by: 'popularity.desc',
      'primary_release_date.gte': DATE_FROM, 'primary_release_date.lte': DATE_TO
    }
  }).then(r => r.data), frontendPage);
}

module.exports = {
  searchMovies, getTrending, discoverMovies,
  getMovieDetail, getSimilar, getMoviesByGenre, getMoviesByActor,
  cacheMovie, TMDB_IMAGE_BASE
};
