import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Atmospheric glow orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/8 blur-[150px] pointer-events-none glow-orb" />
      <div className="fixed bottom-[-30%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-secondary/6 blur-[180px] pointer-events-none glow-orb" style={{ animationDelay: '-6s' }} />
      <div className="fixed top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-tertiary/5 blur-[120px] pointer-events-none glow-orb" style={{ animationDelay: '-3s' }} />

      {/* Simple top navbar */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-16 py-6">
        <span className="text-primary font-black text-2xl tracking-tighter" style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>
          CineTrack
        </span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-full hover:bg-primary-fixed transition-colors shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-16 pt-16 md:pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* AI badge */}
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-2 mb-8 border border-primary/20">
            <span className="material-symbols-outlined text-tertiary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-on-surface-variant text-sm font-semibold">AI-Powered Movie Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="font-black leading-tight mb-6" style={{ fontSize: 'clamp(40px, 8vw, 80px)', letterSpacing: '-0.03em', lineHeight: '1.05' }}>
            <span className="text-on-surface">Your Personal</span>
            <br />
            <span className="text-gradient-primary">Cinema Companion</span>
          </h1>

          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Track everything you've watched. Get AI-powered recommendations.
            Discover your cinematic taste with beautiful charts and insights.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/register"
              className="bg-primary text-on-primary font-bold text-base px-8 py-4 rounded-full hover:bg-primary-fixed transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Start Tracking Free</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              to="/login"
              className="glass-panel text-on-surface font-semibold text-base px-8 py-4 rounded-full hover:bg-surface-variant/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-primary">play_circle</span>
              Sign In
            </Link>
          </div>

          {/* Feature Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="glass-panel rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark_add</span>
              </div>
              <h3 className="text-on-surface font-bold text-lg mb-2">Smart Watchlist</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Track Plan to Watch, Currently Watching, and Watched movies. Rate and review your favorites.</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 hover:border-tertiary/30 transition-colors">
              <div className="w-10 h-10 bg-tertiary/20 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-on-surface font-bold text-lg mb-2">AI Recommendations</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Get personalized movie suggestions powered by local AI. Choose your mood and discover hidden gems.</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 hover:border-secondary/30 transition-colors">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
              </div>
              <h3 className="text-on-surface font-bold text-lg mb-2">Cinema Analytics</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">Discover your favorite genres, total watch time, rating patterns and more through beautiful charts.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-16 pt-8 border-t border-outline-variant/20">
            {[
              { value: 'TMDB', label: 'Movie Database' },
              { value: 'AI', label: 'Powered by Ollama' },
              { value: '∞', label: 'Movies to Discover' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-gradient-primary font-black text-3xl">{stat.value}</div>
                <div className="text-on-surface-variant text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
