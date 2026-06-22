import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore from localStorage and validate
  useEffect(() => {
    const storedToken = localStorage.getItem('cinetrack_token');
    const storedUser = localStorage.getItem('cinetrack_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }

      // Validate token with server
      getMe()
        .then(data => {
          setUser(data.user);
          localStorage.setItem('cinetrack_user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Token invalid, clear everything
          localStorage.removeItem('cinetrack_token');
          localStorage.removeItem('cinetrack_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cinetrack_token', newToken);
    localStorage.setItem('cinetrack_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cinetrack_token');
    localStorage.removeItem('cinetrack_user');
  }, []);

  const isAuthenticated = !loading && !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
