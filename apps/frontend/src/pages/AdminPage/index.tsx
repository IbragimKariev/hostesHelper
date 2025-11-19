import { useState, useEffect } from 'react';
import styles from './adminPage.module.css';

import { Card, CardHeader, Button, PageSpinner } from '@/components/ui';
import {
    useHalls,
    useCreateHall,
    useDeleteHall,
    useUpdateHall,
} from '@/hooks/useHalls';
import { Plus, Trash2, Edit, Grid3x3 } from 'lucide-react';

import { Toolbar, type ToolMode, type TableShape } from './components/Toolbar';
import { HallCanvas } from './components/HallCanvas';
import { CreateHallModal } from './components/CreateHallModal';
import { EditHallModal } from './components/EditHallModal';

import type { CreateHallDto, UpdateHallDto } from '@hostes/shared';

export const AdminPage = () => {
    const { data: halls, isLoading } = useHalls();
    const createHall = useCreateHall();
    const deleteHall = useDeleteHall();
    const updateHall = useUpdateHall();

    const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
    const [toolMode, setToolMode] = useState<ToolMode>('select');
    const [selectedShape, setSelectedShape] = useState<TableShape>('rectangle');
    const [selectedSeats, setSelectedSeats] = useState(4);
    const [isCreateHallModalOpen, setIsCreateHallModalOpen] = useState(false);
    const [isEditHallModalOpen, setIsEditHallModalOpen] = useState(false);

    const selectedHall = halls?.find((h) => h.id === selectedHallId) || null;

    const handleCreateHall = (data: CreateHallDto) => {
        createHall.mutate(data, {
            onSuccess: () => setIsCreateHallModalOpen(false),
        });
    };

    const handleDeleteHall = (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот зал?')) {
            deleteHall.mutate(id);
            if (selectedHallId === id) setSelectedHallId(null);
        }
    };

    const handleUpdateHall = (data: UpdateHallDto) => {
        if (selectedHallId) {
            updateHall.mutate(
                { id: selectedHallId, data },
                {
                    onSuccess: () => setIsEditHallModalOpen(false),
                }
            );
        }
    };

    useEffect(() => {
        if (halls && halls.length > 0 && !selectedHallId) {
            setSelectedHallId(halls[0].id);
        }
    }, [halls, selectedHallId]);

    if (isLoading) return <PageSpinner />;

    return (
        <div className={styles.container}>
            <CreateHallModal
                isOpen={isCreateHallModalOpen}
                onClose={() => setIsCreateHallModalOpen(false)}
                onCreate={handleCreateHall}
                isLoading={createHall.isPending}
            />

            <EditHallModal
                isOpen={isEditHallModalOpen}
                onClose={() => setIsEditHallModalOpen(false)}
                onUpdate={handleUpdateHall}
                hall={selectedHall}
                isLoading={updateHall.isPending}
            />

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Дизайн залов</h1>
                    <p className={styles.subtitle}>
                        Создавайте и редактируйте планировку залов ресторана
                    </p>
                </div>

                <Button
                    leftIcon={<Plus size={20} />}
                    onClick={() => setIsCreateHallModalOpen(true)}
                >
                    Создать зал
                </Button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <Card padding={4}>
                        <CardHeader
                            title="Залы"
                            subtitle={`Всего: ${halls?.length || 0}`}
                        />

                        <div className={styles.hallsList}>
                            {halls?.map((hall) => (
                                <div
                                    key={hall.id}
                                    className={`${styles.hallCard} ${
                                        selectedHall?.id === hall.id
                                            ? styles.hallCardActive
                                            : ''
                                    }`}
                                    onClick={() => setSelectedHallId(hall.id)}
                                >
                                    <div className={styles.hallIcon}>
                                        <Grid3x3 size={24} />
                                    </div>

                                    <div className={styles.hallInfo}>
                                        <div className={styles.hallName}>
                                            {hall.name}
                                        </div>
                                        <div className={styles.hallMeta}>
                                            {hall.width}×{hall.height}м •{' '}
                                            {hall.tables?.length || 0} столов
                                        </div>
                                    </div>

                                    <div
                                        className={styles.hallActions}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className={styles.iconButton}
                                            title="Редактировать"
                                            onClick={() => {
                                                setSelectedHallId(hall.id);
                                                setIsEditHallModalOpen(true);
                                            }}
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            className={styles.iconButton}
                                            title="Удалить"
                                            onClick={() =>
                                                handleDeleteHall(hall.id)
                                            }
                                            disabled={deleteHall.isPending}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {selectedHall && (
                        <Toolbar
                            mode={toolMode}
                            onModeChange={setToolMode}
                            selectedShape={selectedShape}
                            onShapeChange={setSelectedShape}
                            selectedSeats={selectedSeats}
                            onSeatsChange={setSelectedSeats}
                        />
                    )}
                </aside>

                {/* Main content */}
                <div className={styles.mainContent}>
                    {selectedHall ? (
                        <Card padding={6}>
                            <CardHeader
                                title={selectedHall.name}
                                subtitle={`Размер: ${selectedHall.width}×${selectedHall.height} метров`}
                                action={
                                    <Button
                                        variant="outline"
                                        leftIcon={<Edit size={20} />}
                                        onClick={() =>
                                            setIsEditHallModalOpen(true)
                                        }
                                    >
                                        Настройки зала
                                    </Button>
                                }
                            />

                            <div className={styles.canvasWrapper}>
                                <HallCanvas
                                    hall={selectedHall}
                                    mode={toolMode}
                                    newTableConfig={{
                                        shape: selectedShape,
                                        seats: selectedSeats,
                                    }}
                                />
                            </div>

                            <div className={styles.stats}>
                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>
                                        Столиков
                                    </div>
                                    <div className={styles.statValue}>
                                        {selectedHall.tables?.length || 0}
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>
                                        Секций
                                    </div>
                                    <div className={styles.statValue}>
                                        {selectedHall.sections?.length || 0}
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statLabel}>
                                        Всего мест
                                    </div>
                                    <div className={styles.statValue}>
                                        {selectedHall.tables?.reduce(
                                            (sum, t) => sum + t.seats,
                                            0
                                        ) || 0}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🏛️</div>
                            <h2 className={styles.emptyTitle}>Выберите зал</h2>
                            <p className={styles.emptyText}>
                                Выберите зал из списка слева или создайте новый
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
