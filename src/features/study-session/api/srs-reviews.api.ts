import { apiClient } from '../../../shared/lib/api';
import type { ApiResponse } from '../../../shared/types/lela';

export const srsReviewsApi = {
  reviewCard: async (data: any): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/srs-reviews', data);
    return res.data;
  },
};
