import { apiClient } from '../api-client';
import type { LoginDto, AuthResponse } from '@hostes/shared';

export const authApi = {
  login: async (credentials: LoginDto) => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/api/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};
