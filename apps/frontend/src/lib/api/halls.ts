import { apiClient } from '../api-client';
import type { Hall, CreateHallDto, UpdateHallDto, ApiResponse } from '@hostes/shared';

export const hallsApi = {
  getAll: async (): Promise<Hall[]> => {
    const response = await apiClient.get<ApiResponse<Hall[]>>('/api/halls');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Hall> => {
    const response = await apiClient.get<ApiResponse<Hall>>(`/api/halls/${id}`);
    if (!response.data.data) throw new Error('Hall not found');
    return response.data.data;
  },

  create: async (data: CreateHallDto): Promise<Hall> => {
    const response = await apiClient.post<ApiResponse<Hall>>('/api/halls', data);
    if (!response.data.data) throw new Error('Failed to create hall');
    return response.data.data;
  },

  update: async (id: string, data: UpdateHallDto): Promise<Hall> => {
    const response = await apiClient.patch<ApiResponse<Hall>>(`/api/halls/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update hall');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/halls/${id}`);
  },
};
