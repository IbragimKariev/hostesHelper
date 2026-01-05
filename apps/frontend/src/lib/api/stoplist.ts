import { apiClient } from '../api-client';
import type { CreateStopListItemDto, UpdateStopListItemDto, StopListItem } from '@hostes/shared';

export const stoplistApi = {
  getAll: async (all = false) => {
    const response = await apiClient.get<{ success: boolean; data: StopListItem[] }>(
      `/api/stoplist${all ? '?all=true' : ''}`
    );
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get<{ success: boolean; data: StopListItem[] }>(
      '/api/stoplist/today'
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: StopListItem }>(
      `/api/stoplist/${id}`
    );
    return response.data;
  },

  create: async (data: CreateStopListItemDto) => {
    const response = await apiClient.post<{ success: boolean; data: StopListItem }>(
      '/api/stoplist',
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateStopListItemDto) => {
    const response = await apiClient.patch<{ success: boolean; data: StopListItem }>(
      `/api/stoplist/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/stoplist/${id}`
    );
    return response.data;
  },
};
