import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDndMonitor } from '@dnd-kit/core';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { TableItem } from './TableItem';
import { useUpdateTable, useCreateTable, useDeleteTable } from '@/hooks/useTables';
import type { Hall, Table, CreateTableDto, UpdateTableDto } from '@hostes/shared';
import { Trash2, Copy, Edit } from 'lucide-react';
import { Button } from '@/components/ui';
import { EditTableModal } from './EditTableModal';

interface HallCanvasProps {
  hall: Hall;
  mode: 'select' | 'add-table' | 'add-wall';
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

export const HallCanvas = ({ hall, mode, newTableConfig }: HallCanvasProps) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const updateTable = useUpdateTable({ silent: true });
  const updateTableWithToast = useUpdateTable();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();

  const selectedTable = hall.tables?.find((t) => t.id === selectedTableId);

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

        updateTable.mutate({
          id: table.id,
          data: {
            position: { x: clampedX, y: clampedY },
          },
        });
      }
    }

    setDraggedTable(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'add-table' && e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / hall.pixelRatio;
      const y = (e.clientY - rect.top) / hall.pixelRatio;

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
        >
          <Grid $pixelRatio={hall.pixelRatio} />

          {hall.tables?.map((table) => (
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
        {mode === 'add-table' && <InfoHint>💡 Кликните на холст, чтобы добавить столик</InfoHint>}
        {mode === 'select' && !selectedTableId && <InfoHint>💡 Кликните на столик для редактирования</InfoHint>}
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
