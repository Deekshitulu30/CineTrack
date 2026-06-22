const express = require('express');
const { searchMovies, getTrending, discoverMovies, getMovieDetail, getSimilar, getMoviesByGenre, getMoviesByActor, cacheMovie } = require('../services/tmdb');

const router = express.Router();

// GET /api/movies/search?q=&page=
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }
    const results = await searchMovies(q, parseInt(page));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/trending
router.get('/trending', async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const results = await getTrending(parseInt(page));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/discover?page=&genre=
router.get('/discover', async (req, res, next) => {
  try {
    const { page = 1, genre } = req.query;
    const extra = genre ? { with_genres: genre } : {};
    const results = await discoverMovies(parseInt(page), extra);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/actor/:actorId?page=
router.get('/actor/:actorId', async (req, res, next) => {
  try {
    const { actorId } = req.params;
    const { page = 1 } = req.query;
    const results = await getMoviesByActor(actorId, parseInt(page));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:tmdbId/similar — must be BEFORE /:tmdbId
router.get('/:tmdbId/similar', async (req, res, next) => {
  try {
    const results = await getSimilar(req.params.tmdbId);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/genre/:genreId?page=
router.get('/genre/:genreId', async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;
    const results = await getMoviesByGenre(genreId, parseInt(page));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:tmdbId
router.get('/:tmdbId', async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const movie = await getMovieDetail(tmdbId);
    await cacheMovie(movie);
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
