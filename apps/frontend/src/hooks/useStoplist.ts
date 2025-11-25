import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stoplistApi } from '@/lib/api';
import type { CreateStopListItemDto, UpdateStopListItemDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useStoplist = (all = false) => {
  return useQuery({
    queryKey: ['stoplist', { all }],
    queryFn: async () => {
      const { data } = await stoplistApi.getAll(all);
      return data;
    },
  });
};

export const useStoplistToday = () => {
  return useQuery({
    queryKey: ['stoplist', 'today'],
    queryFn: async () => {
      const { data } = await stoplistApi.getToday();
      return data;
    },
  });
};

export const useCreateStoplistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStopListItemDto) => stoplistApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stoplist'] });
      toast.success('Блюдо добавлено в стоп-лист');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateStoplistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStopListItemDto }) =>
      stoplistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stoplist'] });
      toast.success('Стоп-лист обновлен');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteStoplistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stoplistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stoplist'] });
      toast.success('Блюдо удалено из стоп-листа');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
