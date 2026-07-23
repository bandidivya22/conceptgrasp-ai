import { api } from './api';
import type { DashboardData, ProgressData } from '../types';

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get('/dashboard');
    return {
      stats: data.stats,
      charts: data.charts,
      recentActivities: data.recentActivities || [],
    };
  },
};

export const progressService = {
  async get(): Promise<ProgressData> {
    const { data } = await api.get('/progress');
    return data.progress;
  },
};
