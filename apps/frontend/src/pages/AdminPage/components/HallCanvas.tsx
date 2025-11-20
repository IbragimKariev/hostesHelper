import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDndMonitor } from '@dnd-kit/core';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { generateUUID } from '@/utils/uuid';
import { TableItem } from './TableItem';
import { useUpdateTable, useCreateTable, useDeleteTable } from '@/hooks/useTables';
import { useUpdateHall } from '@/hooks/useHalls';
import type { Hall, Table, CreateTableDto, UpdateTableDto, Wall, WallType } from '@hostes/shared';
import { Trash2, Copy, Edit } from 'lucide-react';
import { Button } from '@/components/ui';
import { EditTableModal } from './EditTableModal';

interface HallCanvasProps {
  hall: Hall;
  mode: 'select' | 'add-table' | 'add-wall' | 'add-window' | 'add-entrance';
  newTableConfig: {
    shape: 'rectangle' | 'circle' | 'oval';
    seats: number;
  };
}

// Компонент для мониторинга drag and drop внутри DndContext
const DragMonitor = ({ onDragStart }: { onDragStart: (table: Table) => void }) => {
  useDndMonitor({
    onDragStart(event) {
      const table = event.active.data.current?.table as Table;
      onDragStart(table);
    },
  });
  return null;
};

// Компонент для отрисовки стены/окна/входа
const WallLine = ({
  wall,
  pixelRatio,
  onDoubleClick,
}: {
  wall: Wall;
  pixelRatio: number;
  onDoubleClick: () => void;
}) => {
  const x1 = wall.start.x * pixelRatio;
  const y1 = wall.start.y * pixelRatio;
  const x2 = wall.end.x * pixelRatio;
  const y2 = wall.end.y * pixelRatio;

  // Устанавливаем значение по умолчанию, если wallType не указан
  const wallType = wall.wallType || 'wall';

  let stroke: string = theme.colors.gray[800];
  let strokeWidth = 6;
  let strokeDasharray: string | 'none' = 'none';

  if (wallType === 'window') {
    stroke = '#3B82F6'; // Яркий синий для окна
    strokeWidth = 5;
    strokeDasharray = '8 4';
  } else if (wallType === 'entrance') {
    stroke = '#10B981'; // Яркий зеленый для входа
    strokeWidth = 8;
    strokeDasharray = 'none';
  } else {
    // wall - темно-серый/черный
    stroke = '#1F2937';
    strokeWidth = 6;
    strokeDasharray = 'none';
  }

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      style={{ pointerEvents: 'all', cursor: 'pointer' }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    />
  );
};

export const HallCanvas = ({ hall, mode, newTableConfig }: HallCanvasProps) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [optimisticPositions, setOptimisticPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [drawingWall, setDrawingWall] = useState<{ start: { x: number; y: number } } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const updateTable = useUpdateTable({ silent: true });
  const updateTableWithToast = useUpdateTable();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();
  const updateHall = useUpdateHall({ silent: true });

  const selectedTable = hall.tables?.find((t) => t.id === selectedTableId);

  // Объединяем реальные столики с оптимистичными позициями
  const tablesWithOptimisticPositions = hall.tables?.map((table) => {
    if (optimisticPositions[table.id]) {
      return {
        ...table,
        position: optimisticPositions[table.id],
      };
    }
    return table;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const table = active.data.current?.table as Table;

    if (table) {
      // Если столик не двигался, это был клик для выбора
      if (delta.x === 0 && delta.y === 0) {
        setSelectedTableId(table.id);
      } else {
        // Столик двигали - обновляем позицию
        const newX = table.position.x + delta.x / hall.pixelRatio;
        const newY = table.position.y + delta.y / hall.pixelRatio;

        // Границы зала
        const maxX = hall.width - table.size.width;
        const maxY = hall.height - table.size.height;

        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));

        // Сразу сохраняем оптимистичную позицию
        setOptimisticPositions(prev => ({
          ...prev,
          [table.id]: { x: clampedX, y: clampedY },
        }));

        // Отправляем на сервер
        updateTable.mutate(
          {
            id: table.id,
            data: {
              position: { x: clampedX, y: clampedY },
            },
          },
          {
            // После успешного обновления удаляем оптимистичную позицию
            onSuccess: () => {
              setOptimisticPositions(prev => {
                const newPositions = { ...prev };
                delete newPositions[table.id];
                return newPositions;
              });
            },
            // При ошибке тоже удаляем (откат произойдёт автоматически)
            onError: () => {
              setOptimisticPositions(prev => {
                const newPositions = { ...prev };
                delete newPositions[table.id];
                return newPositions;
              });
            },
          }
        );
      }
    }

    setDraggedTable(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / hall.pixelRatio;
      const y = (e.clientY - rect.top) / hall.pixelRatio;
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    if (mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance') {
      setMousePosition(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / hall.pixelRatio;
    const y = (e.clientY - rect.top) / hall.pixelRatio;

    if (mode === 'add-table' && e.target === e.currentTarget) {
      // Размер столика в зависимости от количества мест
      const getTableSize = (seats: number) => {
        if (seats <= 2) return { width: 0.8, height: 0.8 };
        if (seats <= 4) return { width: 1.2, height: 1.2 };
        if (seats <= 6) return { width: 1.5, height: 1.5 };
        if (seats <= 8) return { width: 2.0, height: 1.0 };
        return { width: 2.5, height: 2.5 };
      };

      const size = getTableSize(newTableConfig.seats);
      const nextNumber = Math.max(0, ...(hall.tables?.map((t) => t.number) || [])) + 1;

      const newTable: CreateTableDto = {
        number: nextNumber,
        seats: newTableConfig.seats,
        shape: newTableConfig.shape,
        position: { x, y },
        size,
        status: 'available',
        rotation: 0,
        hallId: hall.id,
      };

      createTable.mutate(newTable);
    } else if (mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance') {
      // Проверяем, что не кликнули на столик
      const target = e.target as HTMLElement;
      const isTableClick = target.closest('[role="button"]');

      if (!isTableClick) {
        // Начинаем или заканчиваем рисование стены
        if (!drawingWall) {
          // Начинаем рисование
          setDrawingWall({ start: { x, y } });
        } else {
          // Заканчиваем рисование
          const wallType: WallType = mode === 'add-wall' ? 'wall' : mode === 'add-window' ? 'window' : 'entrance';

          const newWall: Wall = {
            id: generateUUID(),
            start: drawingWall.start,
            end: { x, y },
            wallType: wallType,
          };

          const updatedWalls = [...(hall.walls || []), newWall];

          updateHall.mutate({
            id: hall.id,
            data: { walls: updatedWalls },
          });

          setDrawingWall(null);
        }
      }
    } else if (mode === 'select' && e.target === e.currentTarget) {
      setSelectedTableId(null);
    }
  };

  const handleDeleteTable = () => {
    if (selectedTableId) {
      deleteTable.mutate(selectedTableId);
      setSelectedTableId(null);
    }
  };

  const handleDeleteWall = (wallId: string) => {
    const updatedWalls = (hall.walls || []).filter((w) => w.id !== wallId);
    updateHall.mutate({
      id: hall.id,
      data: { walls: updatedWalls },
    });
  };

  const handleDuplicateTable = () => {
    if (selectedTable) {
      const newTable: CreateTableDto = {
        ...selectedTable,
        number: Math.max(0, ...(hall.tables?.map((t) => t.number) || [])) + 1,
        position: {
          x: selectedTable.position.x + 1,
          y: selectedTable.position.y + 1,
        },
      };
      createTable.mutate(newTable);
    }
  };

  const handleUpdateTable = (data: UpdateTableDto) => {
    if (selectedTableId) {
      updateTableWithToast.mutate(
        { id: selectedTableId, data },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
          },
        }
      );
    }
  };

  const handleRotateTable = (tableId: string, newRotation: number) => {
    updateTable.mutate({
      id: tableId,
      data: {
        rotation: newRotation,
      },
    });
  };

  return (
    <Container>
      <DndContext onDragEnd={handleDragEnd}>
        <DragMonitor onDragStart={setDraggedTable} />
        <Canvas
          $width={hall.width * hall.pixelRatio}
          $height={hall.height * hall.pixelRatio}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Grid $pixelRatio={hall.pixelRatio} />

          {/* Стены, окна, входы */}
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
            width={hall.width * hall.pixelRatio}
            height={hall.height * hall.pixelRatio}
          >
            {hall.walls?.map((wall) => (
              <WallLine
                key={wall.id}
                wall={wall}
                pixelRatio={hall.pixelRatio}
                onDoubleClick={() => handleDeleteWall(wall.id)}
              />
            ))}

            {/* Предварительная линия во время рисования */}
            {drawingWall && mousePosition && (
              <line
                x1={drawingWall.start.x * hall.pixelRatio}
                y1={drawingWall.start.y * hall.pixelRatio}
                x2={mousePosition.x * hall.pixelRatio}
                y2={mousePosition.y * hall.pixelRatio}
                stroke={
                  mode === 'add-wall'
                    ? '#1F2937'
                    : mode === 'add-window'
                    ? '#3B82F6'
                    : '#10B981'
                }
                strokeWidth={mode === 'add-entrance' ? 8 : mode === 'add-window' ? 5 : 6}
                strokeDasharray={mode === 'add-window' ? '8 4' : 'none'}
                strokeLinecap="round"
                opacity={0.5}
              />
            )}

            {/* Точка начала при рисовании */}
            {drawingWall && (
              <circle
                cx={drawingWall.start.x * hall.pixelRatio}
                cy={drawingWall.start.y * hall.pixelRatio}
                r={6}
                fill={
                  mode === 'add-wall'
                    ? '#1F2937'
                    : mode === 'add-window'
                    ? '#3B82F6'
                    : '#10B981'
                }
                opacity={0.7}
              />
            )}
          </svg>

          {tablesWithOptimisticPositions?.map((table) => (
            <TableItem
              key={table.id}
              table={table}
              isSelected={table.id === selectedTableId}
              onClick={() => setSelectedTableId(table.id)}
              onRotate={handleRotateTable}
              pixelRatio={hall.pixelRatio}
            />
          ))}

          <DragOverlay>
            {draggedTable && (
              <DragPreview
                $width={draggedTable.size.width * hall.pixelRatio}
                $height={draggedTable.size.height * hall.pixelRatio}
                $shape={draggedTable.shape}
                $rotation={draggedTable.rotation}
              >
                <TableNumber>{draggedTable.number}</TableNumber>
              </DragPreview>
            )}
          </DragOverlay>
        </Canvas>

        {selectedTable && (
          <PropertiesPanel>
            <PanelTitle>Столик №{selectedTable.number}</PanelTitle>
            <PanelContent>
              <Property>
                <PropertyLabel>Мест:</PropertyLabel>
                <PropertyValue>{selectedTable.seats}</PropertyValue>
              </Property>
              <Property>
                <PropertyLabel>Позиция:</PropertyLabel>
                <PropertyValue>
                  X: {selectedTable.position.x.toFixed(1)}м, Y: {selectedTable.position.y.toFixed(1)}м
                </PropertyValue>
              </Property>
              <Property>
                <PropertyLabel>Форма:</PropertyLabel>
                <PropertyValue>
                  {selectedTable.shape === 'rectangle' && 'Прямоугольный'}
                  {selectedTable.shape === 'circle' && 'Круглый'}
                  {selectedTable.shape === 'oval' && 'Овальный'}
                </PropertyValue>
              </Property>
            </PanelContent>
            <PanelActions>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy size={16} />}
                onClick={handleDuplicateTable}
              >
                Дублировать
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={16} />}
                onClick={handleDeleteTable}
              >
                Удалить
              </Button>
            </PanelActions>
          </PropertiesPanel>
        )}
      </DndContext>

      <CanvasInfo>
        <InfoItem>Размер зала: {hall.width}×{hall.height} м</InfoItem>
        <InfoItem>Столиков: {hall.tables?.length || 0}</InfoItem>
        <InfoItem>Стен/окон/входов: {hall.walls?.length || 0}</InfoItem>

        {/* Легенда цветов */}
        {(mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance' || (hall.walls && hall.walls.length > 0)) && (
          <ColorLegend>
            <LegendItem>
              <LegendLine $color="#1F2937" $dasharray="none" $width={4} />
              <LegendLabel>Стена</LegendLabel>
            </LegendItem>
            <LegendItem>
              <LegendLine $color="#3B82F6" $dasharray="8 4" $width={4} />
              <LegendLabel>Окно</LegendLabel>
            </LegendItem>
            <LegendItem>
              <LegendLine $color="#10B981" $dasharray="none" $width={6} />
              <LegendLabel>Вход</LegendLabel>
            </LegendItem>
          </ColorLegend>
        )}

        {mode === 'add-table' && <InfoHint>💡 Кликните на холст, чтобы добавить столик</InfoHint>}
        {(mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance') && !drawingWall && (
          <InfoHint>💡 Кликните на холст, чтобы начать линию • Двойной клик для удаления</InfoHint>
        )}
        {(mode === 'add-wall' || mode === 'add-window' || mode === 'add-entrance') && drawingWall && (
          <InfoHint>💡 Кликните ещё раз, чтобы завершить линию</InfoHint>
        )}
        {mode === 'select' && !selectedTableId && <InfoHint>💡 Двойной клик на стене/окне/входе для удаления</InfoHint>}
        {mode === 'select' && selectedTableId && <InfoHint>✓ Столик выбран</InfoHint>}
      </CanvasInfo>

      <EditTableModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateTable}
        table={selectedTable || null}
        isLoading={updateTableWithToast.isPending}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const Canvas = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  background: white;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  margin: 0 auto;
  cursor: crosshair;
`;

const Grid = styled.div<{ $pixelRatio: number }>`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(${theme.colors.gray[200]} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.colors.gray[200]} 1px, transparent 1px);
  background-size: ${(props) => props.$pixelRatio}px ${(props) => props.$pixelRatio}px;
  pointer-events: none;
`;

const DragPreview = styled.div<{
  $width: number;
  $height: number;
  $shape: string;
  $rotation: number;
}>`
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary[500]};
  border: 2px solid ${theme.colors.primary[700]};
  color: white;
  opacity: 0.8;
  transform: rotate(${(props) => props.$rotation}deg);

  ${(props) => {
    switch (props.$shape) {
      case 'circle':
        return `
          border-radius: 50%;
          aspect-ratio: 1 / 1;
        `;
      case 'oval':
        return `
          border-radius: 50% / 40%;
        `;
      case 'rectangle':
      default:
        return `border-radius: ${theme.borderRadius.lg};`;
    }
  }}
`;

const TableNumber = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const PropertiesPanel = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const PanelTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary[900]};
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Property = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PropertyLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PropertyValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const PanelActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const CanvasInfo = styled.div`
  display: flex;
  gap: ${theme.spacing[6]};
  align-items: center;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
`;

const InfoItem = styled.div`
  color: ${theme.colors.text.secondary};
`;

const InfoHint = styled.div`
  color: ${theme.colors.primary[600]};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: auto;
`;

const ColorLegend = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  align-items: center;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LegendLine = styled.div<{ $color: string; $dasharray: string; $width: number }>`
  width: 32px;
  height: ${(props) => props.$width}px;
  background: ${(props) => props.$color};
  border-radius: 2px;

  ${(props) =>
    props.$dasharray !== 'none' && `
      background: repeating-linear-gradient(
        to right,
        ${props.$color} 0px,
        ${props.$color} 8px,
        transparent 8px,
        transparent 12px
      );
    `
  }
`;

const LegendLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;
