import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import type { CreateReservationDto, UpdateReservationDto, ReservationQueryDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useReservations = (params?: ReservationQueryDto) => {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.getAll(params),
  });
};

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationDto) => reservationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Бронирование создано');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationDto }) =>
      reservationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Бронирование обновлено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Бронирование удалено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Бронирование отменено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
