import { apiClient } from './client';
import type { PaginatedResponse, ListType } from '../types';

export const elementsApi = {
  getElements: async (type: ListType, search: string, offset: number, limit: number) => {
    const { data } = await apiClient.get<PaginatedResponse>('/elements', {
      params: { type, search, offset, limit }
    });
    return data;
  },

  getSelection: async () => {
    const { data } = await apiClient.get<{ ids: number[] }>('/selection');
    return data;
  },

  updateSelection: async (ids: number[]) => {
    const { data } = await apiClient.post('/selection', { ids });
    return data;
  },

  addElement: async (id: number) => {
    const { data } = await apiClient.post('/elements', { id });
    return data;
  },
};
