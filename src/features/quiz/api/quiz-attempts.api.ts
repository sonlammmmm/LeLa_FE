import { apiClient } from '../../../shared/lib/api';
import type { ApiResponse, Page } from '../../../shared/types/lela';

export const quizAttemptsApi = {
  getAll: async (params?: any): Promise<ApiResponse<Page<any>>> => {
    const res = await apiClient.get<ApiResponse<Page<any>>>('/quiz-attempts', { params });
    return res.data;
  },
  create: async (data: any): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/quiz-attempts', data);
    return res.data;
  },
  // In a real flow, a Learner would submit answers via QuizAnswerController, but we use this skeleton for now.
};
