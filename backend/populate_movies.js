const { getDB } = require('./db');

async function populateMovies() {
  const db = getDB();
  
  const mockMovies = [
    {
      tmdb_id: 27205,
      title: 'Inception',
      overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
      poster_path: '/o07wJyNsG12vFV1wz386t2jG165.jpg',
      backdrop_path: '/s3TaeCOXTpwNS73Z7VmF4tJEVKf.jpg',
      release_date: '2010-07-15',
      vote_average: 8.3,
      vote_count: 34500,
      genres: JSON.stringify(['Action', 'Science Fiction', 'Adventure']),
      runtime: 148
    },
    {
      tmdb_id: 603,
      title: 'The Matrix',
      overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents who fight the vast and powerful computers who now rule the earth.',
      poster_path: '/f89U3wzqrRowmJZ9n1v3zxgewYi.jpg',
      backdrop_path: '/oPX9uJik36PtUJZC61a2Jd36DgC.jpg',
      release_date: '1999-03-30',
      vote_average: 8.2,
      vote_count: 24000,
      genres: JSON.stringify(['Action', 'Science Fiction']),
      runtime: 136
    }
  ];

  for (const movie of mockMovies) {
    db.prepare(`
      INSERT OR REPLACE INTO movies (tmdb_id, title, overview, poster_path, backdrop_path, release_date, vote_average, vote_count, genres, runtime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      movie.tmdb_id,
      movie.title,
      movie.overview,
      movie.poster_path,
      movie.backdrop_path,
      movie.release_date,
      movie.vote_average,
      movie.vote_count,
      movie.genres,
      movie.runtime
    );
  }

  console.log('✅ Mock movies populated in local cache!');
}

populateMovies().then(() => process.exit(0)).catch(console.error);
