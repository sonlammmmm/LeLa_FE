import { apiClient } from '../../../shared/lib/api';
import type { ApiResponse, Page, QuizResponse } from '../../../shared/types/lela';

export const quizzesApi = {
  getAll: async (params?: any): Promise<ApiResponse<Page<QuizResponse>>> => {
    const res = await apiClient.get<ApiResponse<Page<QuizResponse>>>('/quizs', { params });
    return res.data;
  },
  getById: async (id: number): Promise<ApiResponse<QuizResponse>> => {
    const res = await apiClient.get<ApiResponse<QuizResponse>>(`/quizs/${id}`);
    return res.data;
  },
  create: async (data: any): Promise<ApiResponse<QuizResponse>> => {
    const res = await apiClient.post<ApiResponse<QuizResponse>>('/quizs', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<ApiResponse<QuizResponse>> => {
    const res = await apiClient.put<ApiResponse<QuizResponse>>(`/quizs/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/quizs/${id}`);
    return res.data;
  }
};
