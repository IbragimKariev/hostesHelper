import { apiClient } from '../api-client';
import type { CreateStaffRuleDto, UpdateStaffRuleDto, StaffRule } from '@hostes/shared';

export const staffRulesApi = {
  getAll: async (all = false) => {
    const response = await apiClient.get<{ success: boolean; data: StaffRule[] }>(
      `/api/staff-rules${all ? '?all=true' : ''}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: StaffRule }>(
      `/api/staff-rules/${id}`
    );
    return response.data;
  },

  create: async (data: CreateStaffRuleDto) => {
    const response = await apiClient.post<{ success: boolean; data: StaffRule }>(
      '/api/staff-rules',
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateStaffRuleDto) => {
    const response = await apiClient.patch<{ success: boolean; data: StaffRule }>(
      `/api/staff-rules/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/staff-rules/${id}`
    );
    return response.data;
  },
};
