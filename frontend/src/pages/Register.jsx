import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const data = await register(email, username, password);
      login(data.token, data.user);
      toast.success(`Welcome to CineTrack, ${data.user.username}! 🎬`);
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-5">
      {/* Atmospheric glow orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none glow-orb" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-tertiary/10 blur-[150px] pointer-events-none glow-orb" style={{ animationDelay: '-4s' }} />

      <main className="w-full max-w-[440px] z-10">
        {/* Glassmorphic Card */}
        <div className="bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant/30 rounded-[24px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Top glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-primary font-black text-4xl tracking-tighter" style={{ fontSize: '36px', letterSpacing: '-0.02em' }}>CineTrack</h1>
            <p className="text-on-surface-variant text-sm mt-2">Your Midnight Cinema Journey Begins</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-on-surface-variant text-sm font-semibold mb-2" htmlFor="reg-username">Display Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. CinephileMike"
                  required
                  minLength={2}
                  className="glass-input w-full rounded-xl py-4 pl-12 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-on-surface-variant text-sm font-semibold mb-2" htmlFor="reg-email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="glass-input w-full rounded-xl py-4 pl-12 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-on-surface-variant text-sm font-semibold mb-2" htmlFor="reg-password">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="glass-input w-full rounded-xl py-4 pl-12 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="text-on-surface-variant/60 text-xs mt-1 ml-1">Must be at least 6 characters</p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container hover:bg-primary text-on-primary-container font-bold text-base py-4 rounded-full transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(160,120,255,0.2)] hover:shadow-[0_0_25px_rgba(160,120,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-outline text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-fixed font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
