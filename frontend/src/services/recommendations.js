import api from './api';

export const getRecommendations = async (mood = 'any') => {
  const res = await api.post('/recommendations', { mood });
  return res.data;
};
