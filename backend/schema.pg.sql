-- ============================================================
-- CineTrack Database Schema — PostgreSQL
-- ============================================================

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL       PRIMARY KEY,
  email      TEXT         NOT NULL UNIQUE,
  username   TEXT         NOT NULL,
  password   TEXT         NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- TABLE: movies  (local TMDB cache)
CREATE TABLE IF NOT EXISTS movies (
  id            SERIAL      PRIMARY KEY,
  tmdb_id       INTEGER     NOT NULL UNIQUE,
  title         TEXT        NOT NULL,
  overview      TEXT,
  poster_path   TEXT,
  backdrop_path TEXT,
  release_date  TEXT,
  vote_average  REAL        DEFAULT 0,
  vote_count    INTEGER     DEFAULT 0,
  genres        TEXT        DEFAULT '[]',
  runtime       INTEGER,
  cached_at     TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  movie_id    INTEGER     NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'plan_to_watch'
                          CHECK(status IN ('plan_to_watch','watching','watched')),
  user_rating INTEGER     CHECK(user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  watched_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- TABLE: reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  movie_id    INTEGER     NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  review_text TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_watchlist_user        ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status ON watchlist(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user          ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb           ON movies(tmdb_id);
