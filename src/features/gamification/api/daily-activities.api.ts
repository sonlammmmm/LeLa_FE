import { apiClient } from '../../../shared/lib/api';
import type { ApiResponse } from '../../../shared/types/lela';

export const dailyActivitiesApi = {
  getToday: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/daily-activities/today');
    return res.data;
  },
  logActivity: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/daily-activities/log');
    return res.data;
  },
  getHistory: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/daily-activities/history', { params });
    return res.data;
  },
};
