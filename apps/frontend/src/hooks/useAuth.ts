import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { LoginDto } from '@hostes/shared';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginDto) => authApi.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Успешный вход');
      }
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
};

export const useLogout = () => {
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Вы вышли из системы');
  };
};

export const useCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
