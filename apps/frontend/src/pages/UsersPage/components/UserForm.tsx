import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select } from '@/components/ui';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { X } from 'lucide-react';
import type { User } from '@hostes/shared';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

interface UserFormProps {
  onClose: () => void;
  user?: User;
}

export const UserForm = ({ onClose, user }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      login: user?.login || '',
      password: '',
      roleId: user?.roleId || '',
    },
  });

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        login: user.login,
        password: '',
        roleId: user.roleId,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (user) {
        // Если пароль не указан при редактировании, не отправляем его
        const updateData = data.password
          ? data
          : { name: data.name, login: data.login, roleId: data.roleId };
        await updateUser.mutateAsync({ id: user.id, data: updateData });
      } else {
        await createUser.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Form error:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader>
        <FormTitle>
          {user ? 'Редактировать пользователя' : 'Новый пользователь'}
        </FormTitle>
        <CloseButton onClick={onClose} type="button">
          <X size={20} />
        </CloseButton>
      </FormHeader>

      <FormContent>
        <Input
          label="Имя"
          placeholder="Иван Иванов"
          error={errors.name?.message}
          {...register('name', {
            required: 'Введите имя',
            minLength: { value: 2, message: 'Минимум 2 символа' },
          })}
        />

        <Input
          label="Логин"
          placeholder="ivan"
          error={errors.login?.message}
          {...register('login', {
            required: 'Введите логин',
            minLength: { value: 3, message: 'Минимум 3 символа' },
          })}
        />

        <Input
          label={user ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
          type="password"
          placeholder="••••••"
          error={errors.password?.message}
          {...register('password', {
            required: user ? false : 'Введите пароль',
            minLength: { value: 6, message: 'Минимум 6 символов' },
          })}
        />

        <Select
          label="Роль"
          error={errors.roleId?.message}
          disabled={rolesLoading}
          {...register('roleId', { required: 'Выберите роль' })}
        >
          <option value="">Выберите роль</option>
          {roles?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name === 'admin' ? 'Администратор' : 'Хостес'}
            </option>
          ))}
        </Select>
      </FormContent>

      <FormFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {user ? 'Сохранить' : 'Создать'}
        </Button>
      </FormFooter>
    </Form>
  );
};

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  min-width: 480px;

  @media (max-width: 640px) {
    min-width: unset;
    width: 100%;
  }
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const FormTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.gray[200]};

  @media (max-width: 640px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
