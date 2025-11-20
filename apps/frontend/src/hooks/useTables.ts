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
    onMutate: async (newTable) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['halls'] });
      await queryClient.cancelQueries({ queryKey: ['tables', newTable.hallId] });

      // Сохраняем предыдущее состояние
      const previousHalls = queryClient.getQueryData(['halls']);
      const previousTables = queryClient.getQueryData(['tables', newTable.hallId]);

      // Создаём временный ID для нового столика
      const tempId = `temp-${Date.now()}`;

      // Оптимистично добавляем столик в кэш halls
      queryClient.setQueryData(['halls'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((hall: any) => {
            if (hall.id === newTable.hallId) {
              return {
                ...hall,
                tables: [
                  ...(hall.tables || []),
                  {
                    id: tempId,
                    ...newTable,
                    status: newTable.status || 'available',
                    rotation: newTable.rotation || 0,
                  },
                ],
              };
            }
            return hall;
          }),
        };
      });

      // Оптимистично добавляем столик в кэш tables
      queryClient.setQueryData(['tables', newTable.hallId], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [
            ...(old.data || []),
            {
              id: tempId,
              ...newTable,
              status: newTable.status || 'available',
              rotation: newTable.rotation || 0,
            },
          ],
        };
      });

      return { previousHalls, previousTables, tempId };
    },
    onError: (error: Error, _, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousHalls) {
        queryClient.setQueryData(['halls'], context.previousHalls);
      }
      if (context?.previousTables) {
        queryClient.setQueryData(['tables', _.hallId], context.previousTables);
      }
      toast.error(`Ошибка: ${error.message}`);
    },
    onSuccess: (_, variables) => {
      // Обновляем данные после успешного ответа сервера
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['halls', variables.hallId] });
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Столик добавлен');
    },
  });
};

export const useCreateTablesBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tables: CreateTableDto[]) => tablesApi.createBulk(tables),
    onMutate: async (newTables) => {
      if (newTables.length === 0) return;

      const hallId = newTables[0].hallId;

      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['halls'] });
      await queryClient.cancelQueries({ queryKey: ['tables', hallId] });

      // Сохраняем предыдущее состояние
      const previousHalls = queryClient.getQueryData(['halls']);
      const previousTables = queryClient.getQueryData(['tables', hallId]);

      // Создаём временные столики с ID
      const tempTables = newTables.map((table, index) => ({
        id: `temp-${Date.now()}-${index}`,
        ...table,
        status: table.status || 'available',
        rotation: table.rotation || 0,
      }));

      // Оптимистично добавляем столики в кэш halls
      queryClient.setQueryData(['halls'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((hall: any) => {
            if (hall.id === hallId) {
              return {
                ...hall,
                tables: [...(hall.tables || []), ...tempTables],
              };
            }
            return hall;
          }),
        };
      });

      // Оптимистично добавляем столики в кэш tables
      queryClient.setQueryData(['tables', hallId], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [...(old.data || []), ...tempTables],
        };
      });

      return { previousHalls, previousTables };
    },
    onError: (error: Error, variables, context) => {
      // Откатываем изменения при ошибке
      if (variables.length > 0 && context) {
        const hallId = variables[0].hallId;
        if (context.previousHalls) {
          queryClient.setQueryData(['halls'], context.previousHalls);
        }
        if (context.previousTables) {
          queryClient.setQueryData(['tables', hallId], context.previousTables);
        }
      }
      toast.error(`Ошибка: ${error.message}`);
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        queryClient.invalidateQueries({ queryKey: ['halls', variables[0].hallId] });
        queryClient.invalidateQueries({ queryKey: ['halls'] });
      }
      toast.success(`${variables.length} столиков добавлено`);
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
    onMutate: async (tableId) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['halls'] });

      // Сохраняем предыдущее состояние
      const previousHalls = queryClient.getQueryData(['halls']);

      // Оптимистично удаляем столик из кэша
      queryClient.setQueryData(['halls'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((hall: any) => {
            if (!hall.tables) return hall;

            return {
              ...hall,
              tables: hall.tables.filter((table: any) => table.id !== tableId),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Столик удалён');
    },
  });
};
