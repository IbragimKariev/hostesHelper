import { useState } from 'react';
import { Card, CardHeader, Button, PageSpinner, Modal } from '@/components/ui';
import { useHalls } from '@/hooks/useHalls';
import { useReservations, useCancelReservation } from '@/hooks/useReservations';
import {
    Calendar,
    Clock,
    Users,
    Phone,
    FileText,
    Filter,
    SquarePen,
    SquareX,
} from 'lucide-react';
import { ReservationForm } from './components/ReservationForm';
import { BookingHallCanvas } from './components/BookingHallCanvas';
import type { Reservation } from '@hostes/shared';

import styles from './BookingPage.module.css';

export const BookingPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHallId, setSelectedHallId] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReservation, setEditingReservation] =
        useState<Reservation | null>(null);
    const [selectedTableId, setSelectedTableId] = useState<string>('');

    const cancelReservation = useCancelReservation();

    const { data: halls, isLoading: hallsLoading } = useHalls();
    const { data: reservations, isLoading: reservationsLoading } =
        useReservations({
            date: selectedDate.toISOString().split('T')[0],
            hallId: selectedHallId || undefined,
        });

    const isLoading = hallsLoading || reservationsLoading;

    // Автовыбор зала
    if (halls && halls.length > 0 && !selectedHallId) {
        setSelectedHallId(halls[0].id);
    }

    if (isLoading) return <PageSpinner />;

    const selectedHall = halls?.find((h) => h.id === selectedHallId);

    const confirmedCount =
        reservations?.filter((r) => r.status === 'confirmed').length || 0;
    const pendingCount =
        reservations?.filter((r) => r.status === 'pending').length || 0;
    const cancelledCount =
        reservations?.filter((r) => r.status === 'cancelled').length || 0;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Бронирование</h1>
                    <p className={styles.subtitle}>
                        Управление бронированиями столиков
                    </p>
                </div>

                <Button
                    leftIcon={<Calendar size={20} />}
                    onClick={() => {
                        setEditingReservation(null);
                        setIsFormOpen(true);
                    }}
                >
                    Новое бронирование
                </Button>
            </div>

            {/* CONTROLS */}
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <div className={styles.label}>
                        <Calendar size={16} /> Дата
                    </div>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) =>
                            setSelectedDate(new Date(e.target.value))
                        }
                    />
                </div>

                <div className={styles.controlGroup}>
                    <div className={styles.label}>
                        <Filter size={16} /> Зал
                    </div>

                    <select
                        value={selectedHallId}
                        onChange={(e) => setSelectedHallId(e.target.value)}
                        className={styles.select}
                    >
                        {halls?.map((hall) => (
                            <option key={hall.id} value={hall.id}>
                                {hall.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* STATS */}
            <div className={styles.statsBar}>
                <div className={`${styles.statCard} ${styles.success}`}>
                    <div className={styles.statValue}>{confirmedCount}</div>
                    <div className={styles.statLabel}>Подтверждено</div>
                </div>

                <div className={`${styles.statCard} ${styles.warning}`}>
                    <div className={styles.statValue}>{pendingCount}</div>
                    <div className={styles.statLabel}>В ожидании</div>
                </div>

                <div className={`${styles.statCard} ${styles.error}`}>
                    <div className={styles.statValue}>{cancelledCount}</div>
                    <div className={styles.statLabel}>Отменено</div>
                </div>

                <div className={`${styles.statCard} ${styles.primary}`}>
                    <div className={styles.statValue}>
                        {reservations?.length || 0}
                    </div>
                    <div className={styles.statLabel}>Всего</div>
                </div>
            </div>

            {/* CONTENT */}
            <div className={styles.content}>
                {/* LEFT SIDE — list */}
                <div className={styles.reservationsList}>
                    <Card>
                        <div className={styles.cardHeaderPadded}>
                            <CardHeader
                                title="Бронирования"
                                subtitle={`${
                                    reservations?.length || 0
                                } бронирований на ${selectedDate.toLocaleDateString(
                                    'ru-RU'
                                )}`}
                            />
                        </div>

                        {reservations?.length ? (
                            <div className={styles.reservationsTable}>
                                {reservations.map((r) => (
                                    <div
                                        key={r.id}
                                        className={`${styles.reservationRow} ${
                                            styles[r.status]
                                        }`}
                                    >
                                        <div>
                                            <div
                                                className={
                                                    styles.reservationTime
                                                }
                                            >
                                                <Clock size={16} />
                                                <span
                                                    className={styles.timeText}
                                                >
                                                    {r.time}
                                                </span>
                                                <span
                                                    className={styles.duration}
                                                >
                                                    {r.duration}ч
                                                </span>

                                                <span
                                                    className={`${
                                                        styles.reservationStatus
                                                    } ${styles[r.status]}`}
                                                >
                                                    {r.status === 'confirmed' &&
                                                        '✓ Подтверждено'}
                                                    {r.status === 'pending' &&
                                                        '⏱ Ожидание'}
                                                    {r.status === 'cancelled' &&
                                                        '✕ Отменено'}
                                                    {r.status === 'completed' &&
                                                        '✓ Завершено'}
                                                </span>
                                            </div>

                                            <div
                                                className={
                                                    styles.reservationInfo
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.reservationMeta
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.customerName
                                                        }
                                                    >
                                                        {r.customerName}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.metaItem
                                                        }
                                                    >
                                                        <Phone size={14} />
                                                        {r.customerPhone}
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.metaItem
                                                        }
                                                    >
                                                        <Users size={14} />
                                                        {r.guests}{' '}
                                                        {r.guests === 1
                                                            ? 'гость'
                                                            : 'гостей'}
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.metaItem
                                                        }
                                                    >
                                                        <FileText size={14} />
                                                        Стол №{r.tableNumber}
                                                    </div>
                                                </div>

                                                {r.specialRequests && (
                                                    <div
                                                        className={
                                                            styles.specialRequests
                                                        }
                                                    >
                                                        {r.specialRequests}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className={
                                                styles.reservationActions
                                            }
                                        >
                                            <Button
                                                title="Изменить"
                                                className={styles.actionButton}
                                                onClick={() => {
                                                    setEditingReservation(r);
                                                    setIsFormOpen(true);
                                                }}
                                            >
                                                <SquarePen />
                                            </Button>

                                            <Button
                                                title="Отменить"
                                                className={`${styles.actionButton} ${styles.danger}`}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            'Отменить бронирование?'
                                                        )
                                                    ) {
                                                        cancelReservation.mutate(
                                                            r.id
                                                        );
                                                    }
                                                }}
                                            >
                                               <SquareX />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📅</div>
                                <div className={styles.emptyTitle}>
                                    Нет бронирований
                                </div>
                                <div className={styles.emptyText}>
                                    На выбранную дату нет бронирований
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* RIGHT SIDE — hall */}
                <div className={styles.hallBar}>
                    <Card>
                        {selectedHall ? (
                            <BookingHallCanvas
                                hall={selectedHall}
                                reservations={reservations || []}
                                selectedDate={
                                    selectedDate.toISOString().split('T')[0]
                                }
                                onTableClick={(tableId) => {
                                    setSelectedTableId(tableId);
                                    setEditingReservation(null);
                                    setIsFormOpen(true);
                                }}
                            />
                        ) : (
                            <>
                                <CardHeader
                                    title="План зала"
                                    subtitle="Выберите зал"
                                />

                                <div className={styles.hallPreview}>
                                    <div className={styles.hallPlaceholder}>
                                        <div className={styles.previewIcon}>
                                            🏛️
                                        </div>
                                        <div className={styles.previewText}>
                                            Выберите зал для просмотра
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            {/* MODAL */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedTableId('');
                }}
            >
                <ReservationForm
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedTableId('');
                    }}
                    hallId={selectedHallId}
                    tables={selectedHall?.tables || []}
                    defaultDate={selectedDate.toISOString().split('T')[0]}
                    defaultTableId={selectedTableId}
                    reservation={editingReservation || undefined}
                />
            </Modal>
        </div>
    );
};
