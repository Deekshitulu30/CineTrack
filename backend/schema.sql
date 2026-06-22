-- ============================================================
-- CineTrack Database Schema
-- Engine: SQLite3 (better-sqlite3)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- TABLE: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  email      TEXT     NOT NULL UNIQUE,
  username   TEXT     NOT NULL,
  password   TEXT     NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLE: movies
-- Local cache of TMDB movie data to reduce API calls
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id       INTEGER NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  overview      TEXT,
  poster_path   TEXT,
  backdrop_path TEXT,
  release_date  TEXT,
  vote_average  REAL    DEFAULT 0,
  vote_count    INTEGER DEFAULT 0,
  genres        TEXT    DEFAULT '[]',
  runtime       INTEGER,
  cached_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLE: watchlist
-- One row per user per movie
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS watchlist (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id    INTEGER  NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  status      TEXT     NOT NULL DEFAULT 'plan_to_watch'
              CHECK(status IN ('plan_to_watch','watching','watched')),
  user_rating INTEGER  CHECK(user_rating IS NULL OR
                       (user_rating >= 1 AND user_rating <= 5)),
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  watched_at  DATETIME,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id)
);

-- ------------------------------------------------------------
-- TABLE: reviews
-- One review per user per movie
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id    INTEGER  NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  review_text TEXT     NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id)
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_watchlist_user        ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status ON watchlist(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user          ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb           ON movies(tmdb_id);
