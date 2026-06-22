import React, { useEffect, useState } from 'react';
import { getWatchlistStats } from '../services/watchlist';
import { useWatchlist } from '../hooks/useWatchlist';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TMDB_IMAGE_BASE } from '../services/movies';

const GENRE_COLORS = [
  '#d0bcff', '#ffb95f', '#4edea3', '#a078ff', '#ee9800',
  '#6d3bd7', '#00a572', '#f44336', '#03a9f4', '#e91e63',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-sm text-on-surface border border-outline-variant/30">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{payload[0].value} movies</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { watchlist, fetchWatchlist } = useWatchlist();

  useEffect(() => {
    fetchWatchlist();
    getWatchlistStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchWatchlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalMovies = stats?.totalMovies || 0;
  const runtimeHrs = stats ? Math.floor(stats.totalRuntimeMinutes / 60) : 0;
  const runtimeMins = stats ? stats.totalRuntimeMinutes % 60 : 0;

  // Build counts map for quick lookup
  const countsMap = {};
  stats?.counts?.forEach(c => { countsMap[c.status] = c.count; });

  // Genre bar chart data (top 8)
  const genreChartData = stats?.genreCounts
    ? Object.entries(stats.genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  // Status pie chart data
  const statusData = [
    { name: 'Watched', value: countsMap['watched'] || 0, color: '#4edea3' },
    { name: 'Watching', value: countsMap['watching'] || 0, color: '#ffb95f' },
    { name: 'Plan to Watch', value: countsMap['plan_to_watch'] || 0, color: '#d0bcff' },
  ].filter(d => d.value > 0);

  // Rated movies for leaderboard
  const ratedMovies = watchlist
    .filter(w => w.user_rating > 0)
    .sort((a, b) => b.user_rating - a.user_rating)
    .slice(0, 5);

  const avgRating = ratedMovies.length
    ? (ratedMovies.reduce((sum, m) => sum + m.user_rating, 0) / ratedMovies.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 md:pb-10">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-black text-on-surface mb-2" style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.02em' }}>
            Cinema Dashboard
          </h1>
          <p className="text-on-surface-variant">Your complete movie stats at a glance</p>
        </div>

        {/* ─── STAT CARDS ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'movie', label: 'Total Movies', value: totalMovies, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { icon: 'check_circle', label: 'Watched', value: countsMap['watched'] || 0, color: 'text-tertiary', bg: 'bg-tertiary/10', border: 'border-tertiary/20' },
            { icon: 'schedule', label: 'Watch Time', value: totalMovies > 0 ? `${runtimeHrs}h ${runtimeMins}m` : '0h', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
            { icon: 'star', label: 'Avg Rating', value: avgRating ? `${avgRating}/10` : 'N/A', color: 'text-primary-container', bg: 'bg-primary-container/10', border: 'border-primary-container/20' },
          ].map((stat, i) => (
            <div key={i} className={`glass-panel rounded-2xl p-5 border ${stat.border} hover:border-opacity-40 transition-colors`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <p className={`${stat.color} font-black text-3xl mb-1`}>{stat.value}</p>
              <p className="text-on-surface-variant text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── CHARTS GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Genre Bar Chart — takes 2 cols */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <h2 className="text-on-surface font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
              Genres Explored
            </h2>
            {genreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={genreChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#cbc3d7', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#cbc3d7', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(208,188,255,0.05)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {genreChartData.map((_, i) => (
                      <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm">
                Add movies to see genre analytics
              </div>
            )}
          </div>

          {/* Status Pie Chart */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-on-surface font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>donut_large</span>
              Watch Status
            </h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => (
                      <span style={{ color: '#cbc3d7', fontSize: '12px' }}>{value}: {entry.payload.value}</span>
                    )}
                  />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="glass-panel rounded-lg px-3 py-2 text-sm text-on-surface">{payload[0].name}: {payload[0].value}</div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm">
                Add movies to see status breakdown
              </div>
            )}
          </div>
        </div>

        {/* ─── TOP RATED MOVIES ─── */}
        {ratedMovies.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-on-surface font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Your Top Rated Movies
            </h2>
            <div className="space-y-3">
              {ratedMovies.map((movie, i) => {
                const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null;
                return (
                  <div key={movie.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high/40 transition-colors">
                    <span className={`text-xl font-black w-8 text-center ${i === 0 ? 'text-secondary' : i === 1 ? 'text-on-surface-variant' : 'text-outline'}`}>
                      {i + 1}
                    </span>
                    {posterUrl ? (
                      <img src={posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-14 bg-surface-container-high rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">movie</span>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="text-on-surface font-semibold text-sm truncate">{movie.title}</p>
                      <p className="text-on-surface-variant text-xs">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-secondary font-bold text-sm">{movie.user_rating}/10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalMovies === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-outline mb-4 block">analytics</span>
            <h2 className="text-xl font-bold text-on-surface mb-2">No data yet</h2>
            <p className="text-on-surface-variant text-sm">Start adding movies to your watchlist to see your stats</p>
          </div>
        )}
      </div>
    </div>
  );
}
