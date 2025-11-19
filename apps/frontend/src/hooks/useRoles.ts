import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await rolesApi.getAll();
      return data;
    },
  });
};
