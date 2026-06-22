const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getRecommendations } = require('../services/ollama');
const { searchMovies } = require('../services/tmdb');
const { query } = require('../db');

const router = express.Router();

// POST /api/recommendations
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { mood = 'any' } = req.body;

    // Get user's watchlist for context (last 20 movies)
    const watchlistRes = await query(`
      SELECT m.title, m.genres
      FROM watchlist w JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
      LIMIT 20
    `, [req.user.userId]);
    const watchlist = watchlistRes.rows;

    if (watchlist.length === 0) {
      return res.status(400).json({
        error: 'Add some movies to your watchlist first to get AI recommendations!'
      });
    }

    const suggestedTitles = await getRecommendations(watchlist, mood);

    if (!suggestedTitles || suggestedTitles.length === 0) {
      return res.status(500).json({ error: 'AI did not return any recommendations. Please try again.' });
    }

    const enriched = await Promise.all(
      suggestedTitles.map(async title => {
        try {
          const results = await searchMovies(title, 1);
          return results.results?.[0] || null;
        } catch {
          return null;
        }
      })
    );

    const recommendations = enriched.filter(Boolean);
    res.json({ recommendations, mood, count: recommendations.length });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI service is offline. Please install and start Ollama.',
        setupInstructions: [
          'Download Ollama from https://ollama.com/download',
          'Run: ollama pull llama3.2',
          'Ollama will run automatically on localhost:11434'
        ]
      });
    }
    next(err);
  }
});

module.exports = router;
