import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dishesOfDayApi } from '@/lib/api';
import type { CreateDishOfDayDto, UpdateDishOfDayDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useDishesOfDay = (all = false) => {
  return useQuery({
    queryKey: ['dishes-of-day', { all }],
    queryFn: async () => {
      const { data } = await dishesOfDayApi.getAll(all);
      return data;
    },
  });
};

export const useDishesOfDayToday = () => {
  return useQuery({
    queryKey: ['dishes-of-day', 'today'],
    queryFn: async () => {
      const { data } = await dishesOfDayApi.getToday();
      return data;
    },
  });
};

export const useCreateDishOfDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDishOfDayDto) => dishesOfDayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes-of-day'] });
      toast.success('Блюдо дня добавлено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateDishOfDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDishOfDayDto }) =>
      dishesOfDayApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes-of-day'] });
      toast.success('Блюдо дня обновлено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteDishOfDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dishesOfDayApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes-of-day'] });
      toast.success('Блюдо дня удалено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
