import { useState } from 'react';
import { Card, CardHeader, Button, PageSpinner, Modal } from '@/components/ui';
import { useWaiters, useDeleteWaiter } from '@/hooks/useWaiters';
import { useCurrentUser } from '@/hooks/useAuth';
import { UserPlus, SquarePen, Trash2, Languages } from 'lucide-react';
import { WaiterForm } from './components/WaiterForm';
import type { Waiter } from '@hostes/shared';

import styles from './WaitersPage.module.css';

export const WaitersPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);

  const currentUser = useCurrentUser();
  const { data: waiters, isLoading } = useWaiters();
  const deleteWaiter = useDeleteWaiter();

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
              Только администраторы могут управлять официантами
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const activeWaiters = waiters?.filter(w => w.isActive) || [];
  const inactiveWaiters = waiters?.filter(w => !w.isActive) || [];

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Официанты</h1>
          <p className={styles.subtitle}>Управление персоналом ресторана</p>
        </div>

        <Button
          leftIcon={<UserPlus size={20} />}
          onClick={() => {
            setEditingWaiter(null);
            setIsFormOpen(true);
          }}
        >
          Добавить официанта
        </Button>
      </div>

      {/* STATS */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{activeWaiters.length}</div>
          <div className={styles.statLabel}>Активных</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{inactiveWaiters.length}</div>
          <div className={styles.statLabel}>Неактивных</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{waiters?.length || 0}</div>
          <div className={styles.statLabel}>Всего</div>
        </div>
      </div>

      {/* WAITERS TABLE */}
      <Card>
        <div style={{ padding: '16px', paddingBottom: 0 }}>
          <CardHeader
            title="Список официантов"
            subtitle={`Всего официантов: ${waiters?.length || 0}`}
          />
        </div>

        {waiters && waiters.length > 0 ? (
          <table className={styles.waitersTable}>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Год рождения</th>
                <th>Языки</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {waiters.map((waiter) => (
                <tr key={waiter.id} className={!waiter.isActive ? styles.inactive : ''}>
                  <td data-label="ФИО">
                    <div className={styles.waiterName}>
                      {waiter.lastName} {waiter.firstName}
                    </div>
                  </td>
                  <td data-label="Год рождения">
                    {waiter.birthYear || '-'}
                  </td>
                  <td data-label="Языки">
                    <div className={styles.languages}>
                      {waiter.languages && waiter.languages.length > 0 ? (
                        waiter.languages.map((lang, idx) => (
                          <span key={idx} className={styles.languageBadge}>
                            <Languages size={12} />
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className={styles.noLanguages}>Не указано</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Статус">
                    <span
                      className={`${styles.statusBadge} ${
                        waiter.isActive ? styles.active : styles.inactiveBadge
                      }`}
                    >
                      {waiter.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td data-label="Действия">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          setEditingWaiter(waiter);
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
                              `Удалить официанта ${waiter.lastName} ${waiter.firstName}?`
                            )
                          ) {
                            deleteWaiter.mutate(waiter.id);
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
            <div className={styles.emptyIcon}>👨‍🍳</div>
            <div className={styles.emptyTitle}>Нет официантов</div>
            <div className={styles.emptyText}>
              Начните с добавления первого официанта
            </div>
          </div>
        )}
      </Card>

      {/* MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWaiter(null);
        }}
      >
        <WaiterForm
          onClose={() => {
            setIsFormOpen(false);
            setEditingWaiter(null);
          }}
          waiter={editingWaiter || undefined}
        />
      </Modal>
    </div>
  );
};

export default WaitersPage;
