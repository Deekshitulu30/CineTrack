# 🎬 CineTrack — AI-Powered Movie Watchlist

> Your personal cinema companion. Track movies, get AI recommendations, explore your taste.

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your TMDB API key and a JWT secret
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit: **http://localhost:5173**

---

## Tech Stack

**Frontend**: React 18, Vite, Tailwind CSS, Recharts, React Router v6  
**Backend**: Node.js, Express.js, SQLite (better-sqlite3), JWT, bcrypt  
**AI**: Ollama (local LLM — llama3)  
**Data**: TMDB API

---

## External Setup Checklist

- [ ] **TMDB API Key**: Get free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) → add to `backend/.env`
- [ ] **JWT Secret**: Generate a 32+ char random string → `backend/.env`
- [ ] **Ollama** (optional, for AI recommendations):
  - Download: [ollama.com/download](https://ollama.com/download)
  - Pull model: `ollama pull llama3`
  - Runs automatically on `localhost:11434`
