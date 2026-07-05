import { apiClient } from '../../../shared/lib/api';
import type { ApiResponse } from '../../../shared/types/lela';

export const dailyActivitiesApi = {
  getToday: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/daily-activities/today');
    return res.data;
  },
};
