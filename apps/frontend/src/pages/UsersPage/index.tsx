import { useState } from 'react';
import { Card, CardHeader, Button, PageSpinner, Modal } from '@/components/ui';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useCurrentUser } from '@/hooks/useAuth';
import { UserPlus, SquarePen, Trash2 } from 'lucide-react';
import { UserForm } from './components/UserForm';
import type { User } from '@hostes/shared';

import styles from './UsersPage.module.css';

export const UsersPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const currentUser = useCurrentUser();
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const isAdmin = currentUser?.role?.name === 'admin';

  if (isLoading) return <PageSpinner />;

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <Card>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔒</div>
            <div className={styles.emptyTitle}>Доступ запрещен</div>
            <div className={styles.emptyText}>
              Только администраторы могут управлять пользователями
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Пользователи</h1>
          <p className={styles.subtitle}>Управление пользователями системы</p>
        </div>

        <Button
          leftIcon={<UserPlus size={20} />}
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
        >
          Добавить пользователя
        </Button>
      </div>

      {/* USERS TABLE */}
      <Card>
        <div style={{ padding: '16px', paddingBottom: 0 }}>
          <CardHeader
            title="Список пользователей"
            subtitle={`Всего пользователей: ${users?.length || 0}`}
          />
        </div>

        {users && users.length > 0 ? (
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Пользователь">
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userLogin}>@{user.login}</div>
                  </td>
                  <td data-label="Роль">
                    <span
                      className={`${styles.roleBadge} ${styles[user.role?.name || '']}`}
                    >
                      {user.role?.name === 'admin' ? 'Администратор' : 'Хостес'}
                    </span>
                  </td>
                  <td data-label="Дата создания">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </td>
                  <td data-label="Действия">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          setEditingUser(user);
                          setIsFormOpen(true);
                        }}
                        title="Редактировать"
                      >
                        <SquarePen size={16} />
                        Изменить
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.danger}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Удалить пользователя ${user.name}?`
                            )
                          ) {
                            deleteUser.mutate(user.id);
                          }
                        }}
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <div className={styles.emptyTitle}>Нет пользователей</div>
            <div className={styles.emptyText}>
              Начните с создания первого пользователя
            </div>
          </div>
        )}
      </Card>

      {/* MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
      >
        <UserForm
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          user={editingUser || undefined}
        />
      </Modal>
    </div>
  );
};
