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

export const useUpdateHall = (options?: { silent?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHallDto }) =>
      hallsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['halls'] });
      await queryClient.cancelQueries({ queryKey: ['halls', id] });

      // Сохраняем предыдущее состояние
      const previousHalls = queryClient.getQueryData(['halls']);
      const previousHall = queryClient.getQueryData(['halls', id]);

      // Оптимистично обновляем кэш halls
      queryClient.setQueryData(['halls'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((hall: any) => {
            if (hall.id === id) {
              return { ...hall, ...data };
            }
            return hall;
          }),
        };
      });

      // Оптимистично обновляем кэш конкретного зала
      queryClient.setQueryData(['halls', id], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: { ...old.data, ...data },
        };
      });

      return { previousHalls, previousHall };
    },
    onError: (error: Error, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousHalls) {
        queryClient.setQueryData(['halls'], context.previousHalls);
      }
      if (context?.previousHall) {
        queryClient.setQueryData(['halls', variables.id], context.previousHall);
      }
      toast.error(`Ошибка: ${error.message}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      queryClient.invalidateQueries({ queryKey: ['halls', variables.id] });
      if (!options?.silent) {
        toast.success('Зал успешно обновлён');
      }
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
