import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '@/lib/api';
import type { CreateTableDto, UpdateTableDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useTables = (hallId?: string) => {
  return useQuery({
    queryKey: ['tables', hallId],
    queryFn: () => tablesApi.getAll(hallId),
    enabled: !!hallId,
  });
};

export const useTable = (id: string) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tablesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableDto) => tablesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['halls', variables.hallId] });
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Столик добавлен');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useCreateTablesBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tables: CreateTableDto[]) => tablesApi.createBulk(tables),
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['halls', variables[0].hallId] });
        queryClient.invalidateQueries({ queryKey: ['halls'] });
      }
      toast.success(`${variables.length} столиков добавлено`);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateTable = (options?: { silent?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tablesApi.update(id, data),
    // Оптимистичное обновление - обновляем UI сразу, не дожидаясь ответа сервера
    onMutate: async ({ id, data }) => {
      // Отменяем текущие запросы для этих данных
      await queryClient.cancelQueries({ queryKey: ['halls'] });

      // Сохраняем предыдущее состояние для отката при ошибке
      const previousHalls = queryClient.getQueryData(['halls']);

      // Оптимистично обновляем кеш
      queryClient.setQueryData(['halls'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((hall: any) => {
            if (!hall.tables) return hall;

            return {
              ...hall,
              tables: hall.tables.map((table: any) => {
                if (table.id === id) {
                  return { ...table, ...data };
                }
                return table;
              }),
            };
          }),
        };
      });

      return { previousHalls };
    },
    onError: (error: Error, _, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousHalls) {
        queryClient.setQueryData(['halls'], context.previousHalls);
      }
      toast.error(`Ошибка: ${error.message}`);
    },
    onSuccess: (data) => {
      // Обновляем данные после успешного ответа сервера
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tables', data.id] });
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      if (data.hallId) {
        queryClient.invalidateQueries({ queryKey: ['halls', data.hallId] });
      }
      if (!options?.silent) {
        toast.success('Столик обновлён');
      }
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tablesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Столик удалён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
