import { apiClient } from '../../../shared/lib/api';
import type { FlashcardResponse, Page } from '../../../shared/types/lela';

export const flashcardsApi = {
  getByDeckId: async (deckId: number, params?: { page?: number; size?: number; sortBy?: string; direction?: string }): Promise<Page<FlashcardResponse>> => {
    const res = await apiClient.get<Page<FlashcardResponse>>(`/flashcards/deck/${deckId}`, { params });
    return res.data;
  },
  create: async (data: any): Promise<FlashcardResponse> => {
    const res = await apiClient.post<FlashcardResponse>('/flashcards', data);
    return res.data;
  },
  update: async (id: number, data: any): Promise<FlashcardResponse> => {
    const res = await apiClient.patch<FlashcardResponse>(`/flashcards/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    const res = await apiClient.delete<void>(`/flashcards/${id}`);
    return res.data;
  },
};
