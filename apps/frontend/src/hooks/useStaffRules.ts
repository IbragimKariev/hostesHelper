import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffRulesApi } from '@/lib/api';
import type { CreateStaffRuleDto, UpdateStaffRuleDto } from '@hostes/shared';
import toast from 'react-hot-toast';

export const useStaffRules = (all = false) => {
  return useQuery({
    queryKey: ['staff-rules', { all }],
    queryFn: async () => {
      const { data } = await staffRulesApi.getAll(all);
      return data;
    },
  });
};

export const useCreateStaffRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffRuleDto) => staffRulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rules'] });
      toast.success('Правило добавлено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useUpdateStaffRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffRuleDto }) =>
      staffRulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rules'] });
      toast.success('Правило обновлено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useDeleteStaffRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffRulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-rules'] });
      toast.success('Правило удалено');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};
