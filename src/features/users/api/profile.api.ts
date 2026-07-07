import type { ApiResponse } from '../../../shared/types/lela';
import { apiClient } from '../../../shared/lib/api';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  roles: string[];
  status: string;
  xpTotal: number;
  streakCurrent: number;
  streakLongest: number;
  dailyGoalCards: number;
  timezone: string;
  nativeLanguageId?: number;
  targetLanguageId?: number;
  promptDailyGoal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  avatarUrl?: string;
  timezone?: string;
  dailyGoalCards?: number;
  nativeLanguageId?: number;
  targetLanguageId?: number;
  promptDailyGoal?: boolean;
}

export const profileApi = {
  getMe: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateMe: async (data: ProfileUpdateRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
  },
};
