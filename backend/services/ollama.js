const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function getRecommendations(watchlistMovies, mood = 'any') {
  const movieList = watchlistMovies
    .map(m => {
      let genres = [];
      try { genres = JSON.parse(m.genres || '[]').slice(0, 2); } catch {}
      return `${m.title}${genres.length ? ` (${genres.join(', ')})` : ''}`;
    })
    .join(', ');

  const moodText = mood === 'any' ? 'any genre' : mood;

  const prompt =
    `I have watched or saved these movies: ${movieList}. ` +
    `Based on my taste, suggest exactly 5 ${moodText} movies I would enjoy. ` +
    `Reply with movie titles only, one per line, no numbering, no explanation, no bullets.`;

  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: 'llama3.2',
    prompt,
    stream: false
  }, { timeout: 30000 });

  const titles = response.data.response
    .split('\n')
    .map(t => t.trim().replace(/^[-*\d.)\s]+/, '').trim())
    .filter(t => t.length > 2)
    .slice(0, 5);

  return titles;
}

module.exports = { getRecommendations };
