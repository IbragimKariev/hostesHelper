import { apiClient } from '../api-client';
import type { Table, CreateTableDto, UpdateTableDto, ApiResponse } from '@hostes/shared';

export const tablesApi = {
  getAll: async (hallId?: string): Promise<Table[]> => {
    const params = hallId ? { hallId } : {};
    const response = await apiClient.get<ApiResponse<Table[]>>('/api/tables', { params });
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Table> => {
    const response = await apiClient.get<ApiResponse<Table>>(`/api/tables/${id}`);
    if (!response.data.data) throw new Error('Table not found');
    return response.data.data;
  },

  create: async (data: CreateTableDto): Promise<Table> => {
    const response = await apiClient.post<ApiResponse<Table>>('/api/tables', data);
    if (!response.data.data) throw new Error('Failed to create table');
    return response.data.data;
  },

  createBulk: async (tables: CreateTableDto[]): Promise<Table[]> => {
    const response = await apiClient.post<ApiResponse<Table[]>>('/api/tables/bulk', { tables });
    return response.data.data || [];
  },

  update: async (id: string, data: UpdateTableDto): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/api/tables/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update table');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tables/${id}`);
  },
};
