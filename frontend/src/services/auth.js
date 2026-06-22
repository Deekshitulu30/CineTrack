import api from './api';

export const register = async (email, username, password) => {
  const res = await api.post('/auth/register', { email, username, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
