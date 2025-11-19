import { apiClient } from '../api-client';
import type { CreateUserDto, UpdateUserDto, User } from '@hostes/shared';

export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/api/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/api/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto) => {
    const response = await apiClient.post<{ success: boolean; data: User }>('/api/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto) => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};
