import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '@/lib/api';
import type { CreateHallDto, UpdateHallDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useHalls = () => {
  return useQuery({
    queryKey: ['halls'],
    queryFn: hallsApi.getAll,
  });
};

export const useHall = (id: string) => {
  return useQuery({
    queryKey: ['halls', id],
    queryFn: () => hallsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHallDto) => hallsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Зал успешно создан');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHallDto }) =>
      hallsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      queryClient.invalidateQueries({ queryKey: ['halls', variables.id] });
      toast.success('Зал успешно обновлён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteHall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hallsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Зал успешно удалён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
