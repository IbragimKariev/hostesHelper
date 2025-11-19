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
    onSuccess: (data) => {
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
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
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
