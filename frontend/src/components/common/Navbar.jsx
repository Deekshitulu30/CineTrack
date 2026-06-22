import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/home', label: 'Home', icon: 'home' },
    { to: '/search', label: 'Search', icon: 'search' },
    { to: '/watchlist', label: 'Watchlist', icon: 'bookmark' },
    { to: '/recommendations', label: 'Recommendations', icon: 'auto_awesome' },
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden md:flex bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/20 shadow-md shadow-primary/10">
        <div className="flex justify-between items-center px-16 h-20 w-full max-w-[1440px] mx-auto">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/home' : '/'} className="text-4xl font-black text-primary tracking-tighter leading-none hover:opacity-90 transition-opacity" style={{ fontSize: '28px', letterSpacing: '-0.02em', fontWeight: '800' }}>
              CineTrack
            </Link>
            {isAuthenticated && (
              <div className="flex gap-6">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-[16px] font-medium transition-colors duration-200 hover:text-primary ${
                      isActive(link.to)
                        ? 'text-primary font-bold border-b-2 border-primary pb-1'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Search + User */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <form onSubmit={handleSearch} className="relative hidden lg:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="glass-input rounded-full py-2 pl-10 pr-4 w-56 focus:w-72 transition-all duration-300 text-sm"
                  />
                </form>
                <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary text-sm font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-on-surface-variant text-sm font-medium hidden xl:block">{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                    title="Logout"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex gap-3">
                <Link to="/login" className="text-primary font-semibold text-sm hover:text-primary-fixed transition-colors">Sign In</Link>
                <Link to="/register" className="bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-fixed transition-colors">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface-container/90 backdrop-blur-lg border-t border-outline-variant/10 shadow-2xl shadow-primary/20 rounded-t-xl z-50">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive(link.to)
                  ? 'bg-primary-container/20 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
              }`}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={isActive(link.to) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {link.label === 'Recommendations' ? 'AI' : link.label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
