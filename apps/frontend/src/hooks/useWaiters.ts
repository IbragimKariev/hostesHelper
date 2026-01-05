import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waitersApi } from '@/lib/api';
import type { CreateWaiterDto, UpdateWaiterDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useWaiters = (active?: boolean) => {
  return useQuery({
    queryKey: ['waiters', { active }],
    queryFn: async () => {
      const { data } = await waitersApi.getAll(active);
      return data;
    },
  });
};

export const useWaiter = (id: string) => {
  return useQuery({
    queryKey: ['waiters', id],
    queryFn: async () => {
      const { data } = await waitersApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateWaiter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWaiterDto) => waitersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
      toast.success('Официант добавлен');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateWaiter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWaiterDto }) =>
      waitersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
      toast.success('Официант обновлен');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteWaiter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => waitersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
      toast.success('Официант удален');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
