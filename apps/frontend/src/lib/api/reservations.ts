import { apiClient } from '../api-client';
import type {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
  ReservationQueryDto,
  ApiResponse,
} from '@hostes/shared';

export const reservationsApi = {
  getAll: async (params?: ReservationQueryDto): Promise<Reservation[]> => {
    const response = await apiClient.get<ApiResponse<Reservation[]>>('/api/reservations', { params });
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Reservation> => {
    const response = await apiClient.get<ApiResponse<Reservation>>(`/api/reservations/${id}`);
    if (!response.data.data) throw new Error('Reservation not found');
    return response.data.data;
  },

  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>('/api/reservations', data);
    if (!response.data.data) throw new Error('Failed to create reservation');
    return response.data.data;
  },

  update: async (id: string, data: UpdateReservationDto): Promise<Reservation> => {
    const response = await apiClient.patch<ApiResponse<Reservation>>(`/api/reservations/${id}`, data);
    if (!response.data.data) throw new Error('Failed to update reservation');
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reservations/${id}`);
  },

  cancel: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>(`/api/reservations/${id}/cancel`);
    if (!response.data.data) throw new Error('Failed to cancel reservation');
    return response.data.data;
  },

  checkAvailability: async (tableId: string, date: string): Promise<Reservation[]> => {
    const response = await apiClient.get<ApiResponse<{ reservations: Reservation[] }>>(
      `/api/reservations/availability/${tableId}`,
      { params: { date } }
    );
    return response.data.data?.reservations || [];
  },
};
