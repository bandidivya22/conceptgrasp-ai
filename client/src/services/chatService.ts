import { api } from './api';
import type { Conversation, ChatMessage } from '../types';

export interface ChatPayload {
  message: string;
  conversationId?: string;
}

const toConversation = (d: any): Conversation => ({
  id: d._id || d.id,
  title: d.title,
  messages: (d.messages || []) as ChatMessage[],
  created_at: d.createdAt || d.created_at || '',
  updated_at: d.updatedAt || d.updated_at || '',
});

export const chatService = {
  async send(payload: ChatPayload): Promise<{ reply: string; conversationId: string }> {
    const { data } = await api.post('/chat', {
      message: payload.message,
      conversationId: payload.conversationId,
    });
    return { reply: data.reply, conversationId: data.conversationId };
  },

  async getHistory(): Promise<Conversation[]> {
    const { data } = await api.get('/chat/history');
    return (data.conversations || []).map(toConversation);
  },

  async getConversation(id: string): Promise<Conversation> {
    const { data } = await api.get(`/chat/${id}`);
    return toConversation(data.conversation);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/chat/${id}`);
  },
};
