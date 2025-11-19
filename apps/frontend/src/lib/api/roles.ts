import { apiClient } from '../api-client';
import type { Role } from '@hostes/shared';

export const rolesApi = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: Role[] }>('/api/roles');
    return response.data;
  },
};
