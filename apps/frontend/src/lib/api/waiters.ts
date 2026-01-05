import { apiClient } from '../api-client';
import type { CreateWaiterDto, UpdateWaiterDto, Waiter } from '@hostes/shared';

export const waitersApi = {
  getAll: async (active?: boolean) => {
    const params = active !== undefined ? { active: String(active) } : {};
    const response = await apiClient.get<{ success: boolean; data: Waiter[] }>('/api/waiters', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Waiter }>(`/api/waiters/${id}`);
    return response.data;
  },

  create: async (data: CreateWaiterDto) => {
    const response = await apiClient.post<{ success: boolean; data: Waiter }>('/api/waiters', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWaiterDto) => {
    const response = await apiClient.patch<{ success: boolean; data: Waiter }>(`/api/waiters/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/waiters/${id}`);
    return response.data;
  },
};
