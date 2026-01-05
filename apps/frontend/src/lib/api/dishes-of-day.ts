import { apiClient } from '../api-client';
import type { CreateDishOfDayDto, UpdateDishOfDayDto, DishOfDay } from '@hostes/shared';

export const dishesOfDayApi = {
  getAll: async (all = false) => {
    const response = await apiClient.get<{ success: boolean; data: DishOfDay[] }>(
      `/api/dishes-of-day${all ? '?all=true' : ''}`
    );
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get<{ success: boolean; data: DishOfDay[] }>(
      '/api/dishes-of-day/today'
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: DishOfDay }>(
      `/api/dishes-of-day/${id}`
    );
    return response.data;
  },

  create: async (data: CreateDishOfDayDto) => {
    const response = await apiClient.post<{ success: boolean; data: DishOfDay }>(
      '/api/dishes-of-day',
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateDishOfDayDto) => {
    const response = await apiClient.patch<{ success: boolean; data: DishOfDay }>(
      `/api/dishes-of-day/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/dishes-of-day/${id}`
    );
    return response.data;
  },
};
