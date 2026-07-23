import { api } from './api';
import type { DocumentItem } from '../types';

export interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
}

const toCamel = (d: any): DocumentItem => ({
  id: d._id || d.id,
  title: d.title,
  description: d.description || '',
  file_name: d.fileName || d.file_name || '',
  file_type: d.fileType || d.file_type || 'application/octet-stream',
  file_size: d.fileSize || d.file_size || 0,
  content: d.content || '',
  subject: d.subject || 'General',
  tags: d.tags || [],
  created_at: d.createdAt || d.created_at || '',
  updated_at: d.updatedAt || d.updated_at || '',
});

export const documentService = {
  async upload(file: File, metadata: { title?: string; description?: string; subject?: string; tags?: string }): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.subject) formData.append('subject', metadata.subject);
    if (metadata.tags) formData.append('tags', metadata.tags);

    const { data } = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toCamel(data.document);
  },

  async getAll(query: DocumentQuery = {}): Promise<{ documents: DocumentItem[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const { data } = await api.get('/documents', {
      params: {
        page: query.page || 1,
        limit: query.limit || 9,
        search: query.search || '',
        subject: query.subject || '',
      },
    });
    return {
      documents: (data.documents || []).map(toCamel),
      pagination: data.pagination || { page: 1, limit: 9, total: 0, pages: 0 },
    };
  },

  async getById(id: string): Promise<DocumentItem> {
    const { data } = await api.get(`/documents/${id}`);
    return toCamel(data.document);
  },

  async getContent(id: string): Promise<string> {
    const { data } = await api.get(`/documents/${id}/content`);
    return data.content || '';
  },

  async update(id: string, payload: { title?: string; description?: string; subject?: string; tags?: string[] | string }): Promise<DocumentItem> {
    const { data } = await api.put(`/documents/${id}`, payload);
    return toCamel(data.document);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
