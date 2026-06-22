import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const data = await login(email, password);
      authLogin(data.token, data.user);
      toast.success(`Welcome back, ${data.user.username}! 🎬`);
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-5">
      {/* Atmospheric glow orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none glow-orb" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-inverse-primary/10 blur-[150px] pointer-events-none glow-orb" style={{ animationDelay: '-4s' }} />

      <main className="w-full max-w-[420px] z-10">
        {/* Glassmorphic Card */}
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.8)] relative overflow-hidden border-top-glow">
          {/* Inner top glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>movie</span>
            </div>
            <h1 className="text-on-surface font-black text-2xl tracking-tighter">CineTrack</h1>
            <p className="text-on-surface-variant text-sm mt-1">Midnight Cinema Experience</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2" htmlFor="login-email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="glass-input w-full rounded-xl py-3.5 pl-12 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2" htmlFor="login-password">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="glass-input w-full rounded-xl py-3.5 pl-12 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-inverse-primary hover:bg-primary-container text-on-primary font-bold text-base py-3.5 rounded-full shadow-[0_4px_14px_rgba(109,59,215,0.4)] hover:shadow-[0_6px_20px_rgba(109,59,215,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 group"
              >
                {loading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Register link */}
          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-fixed font-bold transition-colors">
                Register Free
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
