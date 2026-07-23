import { api } from './api'; 
import type { Flashcard } from '../types';

export interface GeneratePayload {
  documentId?: string;
  subject?: string;
  content?: string;
  count?: number;
}

export const flashcardService = {
  getAll: async (params?: any): Promise<Flashcard[]> => {
    const response = await api.get('/flashcards', { params });
    return response.data?.flashcards || response.data || [];
  },

  generate: async (payload: GeneratePayload): Promise<Flashcard[]> => {
    const response = await api.post('/flashcards/generate', {
      subject: payload.subject || 'General',
      count: payload.count || 10,
      documentId: payload.documentId || undefined,
      content: payload.content || undefined,
    });
    return response.data?.flashcards || response.data || [];
  },

  update: async (id: string, payload: Partial<Flashcard>): Promise<Flashcard> => {
    const response = await api.put(`/flashcards/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  }
};