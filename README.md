# 🎬 CineTrack — AI-Powered Movie Watchlist

> Your personal cinema companion. Track movies, get AI recommendations, explore your taste.

🌐 **Live Demo**: [https://Deekshitulu30.github.io/CineTrack/](https://Deekshitulu30.github.io/CineTrack/)

---

## Quick Start (Local Development)

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
# Set VITE_API_URL=http://localhost:5000 for local dev
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

## GitHub Pages Deployment

The frontend is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

### How it works
1. Push to `main` triggers the [deploy workflow](.github/workflows/deploy.yml)
2. GitHub Actions builds the Vite frontend
3. The built `dist/` is deployed to the `gh-pages` branch
4. Available at: `https://Deekshitulu30.github.io/CineTrack/`

### Backend API (for full functionality)

GitHub Pages only serves static files. To enable all features, deploy the backend to a free hosting service:

| Service | Free Tier | Notes |
|---------|-----------|-------|
| [Render](https://render.com) | ✅ Yes | Easiest, supports Node.js |
| [Railway](https://railway.app) | ✅ Yes | Fast deploys |
| [Fly.io](https://fly.io) | ✅ Yes | Docker-based |

After deploying your backend, set the `VITE_API_URL` secret in your GitHub repo:
> **Settings → Secrets and variables → Actions → New repository secret**  
> Name: `VITE_API_URL`  
> Value: `https://your-backend-url.onrender.com`

Then push to `main` again to rebuild and redeploy.

---

## External Setup Checklist

- [ ] **TMDB API Key**: Get free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) → add to `backend/.env`
- [ ] **JWT Secret**: Generate a 32+ char random string → `backend/.env`
- [ ] **Ollama** (optional, for AI recommendations):
  - Download: [ollama.com/download](https://ollama.com/download)
  - Pull model: `ollama pull llama3`
  - Runs automatically on `localhost:11434`
- [ ] **GitHub Pages**: Enable in repo Settings → Pages → Source: `gh-pages` branch
- [ ] **Backend hosting** (optional): Deploy to Render/Railway and set `VITE_API_URL` GitHub secret
