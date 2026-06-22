const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../db');
const { cacheMovie, getMovieDetail } = require('../services/tmdb');

const router = express.Router();
router.use(authenticateToken);

// GET /api/watchlist/stats — MUST be before /:id
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const countsRes = await query(
      `SELECT status, COUNT(*) as count FROM watchlist WHERE user_id = $1 GROUP BY status`,
      [userId]
    );

    const runtimeRes = await query(
      `SELECT COALESCE(SUM(m.runtime), 0) as total
       FROM watchlist w JOIN movies m ON w.movie_id = m.id
       WHERE w.user_id = $1 AND w.status = 'watched'`,
      [userId]
    );

    const genreRes = await query(
      `SELECT m.genres FROM watchlist w JOIN movies m ON w.movie_id = m.id WHERE w.user_id = $1`,
      [userId]
    );

    const genreCounts = {};
    genreRes.rows.forEach(row => {
      try {
        JSON.parse(row.genres || '[]').forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      } catch {}
    });

    const totalRes = await query(
      'SELECT COUNT(*) as total FROM watchlist WHERE user_id = $1',
      [userId]
    );

    res.json({
      counts: countsRes.rows,
      totalMovies: parseInt(totalRes.rows[0].total),
      totalRuntimeMinutes: parseInt(runtimeRes.rows[0].total),
      genreCounts
    });
  } catch (err) { next(err); }
});

// GET /api/watchlist
router.get('/', async (req, res, next) => {
  try {
    const { status, sort = 'added_at' } = req.query;
    const allowedSorts = { added_at: 'w.added_at', title: 'm.title', user_rating: 'w.user_rating' };
    const sortColumn = allowedSorts[sort] || 'w.added_at';

    let sql = `
      SELECT w.id, w.user_id, w.movie_id, w.status, w.user_rating,
             w.added_at, w.watched_at, w.updated_at,
             m.tmdb_id, m.title, m.poster_path, m.backdrop_path,
             m.release_date, m.vote_average, m.genres, m.runtime, m.overview
      FROM watchlist w JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = $1`;
    const params = [req.user.userId];

    if (status) {
      params.push(status);
      sql += ` AND w.status = $${params.length}`;
    }
    sql += ` ORDER BY ${sortColumn} DESC`;

    const result = await query(sql, params);
    res.json({ entries: result.rows });
  } catch (err) { next(err); }
});

// POST /api/watchlist
router.post('/', async (req, res, next) => {
  try {
    const { tmdb_id, status = 'plan_to_watch', user_rating } = req.body;
    if (!tmdb_id) return res.status(400).json({ error: 'tmdb_id is required' });

    // Ensure movie is cached
    let movieRes = await query('SELECT * FROM movies WHERE tmdb_id = $1', [tmdb_id]);
    if (movieRes.rows.length === 0) {
      const tmdbData = await getMovieDetail(tmdb_id);
      await cacheMovie(tmdbData);
      movieRes = await query('SELECT * FROM movies WHERE tmdb_id = $1', [tmdb_id]);
    }
    const movie = movieRes.rows[0];

    const insertRes = await query(
      'INSERT INTO watchlist (user_id, movie_id, status, user_rating) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.userId, movie.id, status, user_rating || null]
    );

    const entryRes = await query(`
      SELECT w.*, m.tmdb_id, m.title, m.poster_path, m.release_date, m.vote_average, m.genres, m.runtime
      FROM watchlist w JOIN movies m ON w.movie_id = m.id WHERE w.id = $1
    `, [insertRes.rows[0].id]);

    res.status(201).json({ entry: entryRes.rows[0] });
  } catch (err) {
    if (err.code === '23505') // Postgres unique violation
      return res.status(409).json({ error: 'Movie already in watchlist' });
    next(err);
  }
});

// PATCH /api/watchlist/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, user_rating, review_text } = req.body;
    const { id } = req.params;

    const entryRes = await query(
      'SELECT * FROM watchlist WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    const entry = entryRes.rows[0];
    if (!entry) return res.status(404).json({ error: 'Watchlist entry not found' });

    const newStatus  = status || entry.status;
    const newRating  = user_rating !== undefined ? user_rating : entry.user_rating;
    const watched_at = newStatus === 'watched'
      ? (entry.watched_at || new Date().toISOString())
      : entry.watched_at;

    await query(
      `UPDATE watchlist SET status=$1, user_rating=$2, watched_at=$3, updated_at=NOW() WHERE id=$4`,
      [newStatus, newRating, watched_at, id]
    );

    if (review_text !== undefined) {
      await query(`
        INSERT INTO reviews (user_id, movie_id, review_text)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, movie_id) DO UPDATE SET review_text=$3, updated_at=NOW()
      `, [req.user.userId, entry.movie_id, review_text]);
    }

    const updatedRes = await query(`
      SELECT w.*, m.tmdb_id, m.title, m.poster_path, m.release_date, m.vote_average, m.genres, m.runtime
      FROM watchlist w JOIN movies m ON w.movie_id = m.id WHERE w.id = $1
    `, [id]);

    res.json({ entry: updatedRes.rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/watchlist/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const entryRes = await query(
      'SELECT * FROM watchlist WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (!entryRes.rows[0])
      return res.status(404).json({ error: 'Entry not found or unauthorized' });

    await query('DELETE FROM watchlist WHERE id = $1', [req.params.id]);
    res.json({ message: 'Removed from watchlist successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
