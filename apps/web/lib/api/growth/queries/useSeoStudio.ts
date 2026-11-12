import apiClient from '@/lib/api/client';

export const fetchContentIdeas = () =>
  apiClient.get('/growth/seo-studio/content-ideas').then((response) => response.data);

export const fetchAcquisition = (days = 30) =>
  apiClient.get('/growth/seo-studio/acquisition', { params: { days } }).then((response) => response.data);

export const fetchGrowthHealth = () =>
  apiClient.get('/growth/seo-studio/health-summary').then((response) => response.data);
