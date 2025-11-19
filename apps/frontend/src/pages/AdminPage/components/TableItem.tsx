import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { RotateCw } from 'lucide-react';
import type { Table } from '@hostes/shared';

interface TableItemProps {
  table: Table;
  isSelected: boolean;
  onClick?: () => void;
  onRotate?: (tableId: string, newRotation: number) => void;
  pixelRatio: number;
}

export const TableItem = ({ table, isSelected, pixelRatio, onRotate }: TableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: { table },
  });

  // Объединяем трансформации: драг + поворот
  const dragTransform = CSS.Translate.toString(transform);
  const rotateTransform = `rotate(${table.rotation}deg)`;
  const combinedTransform = dragTransform
    ? `${dragTransform} ${rotateTransform}`
    : rotateTransform;

  const style = {
    transform: combinedTransform,
    left: `${table.position.x * pixelRatio}px`,
    top: `${table.position.y * pixelRatio}px`,
    width: `${table.size.width * pixelRatio}px`,
    height: `${table.size.height * pixelRatio}px`,
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRotate) {
      // Поворачиваем на 45 градусов при каждом клике
      const newRotation = (table.rotation + 45) % 360;
      onRotate(table.id, newRotation);
    }
  };

  return (
    <Container
      ref={setNodeRef}
      style={style}
      $shape={table.shape}
      $isSelected={isSelected}
      $isDragging={isDragging}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`Столик номер ${table.number}, ${table.seats} мест`}
      aria-pressed={isSelected}
    >
      <DragHandle {...listeners}>
        <TableNumber>{table.number}</TableNumber>
        <TableSeats>{table.seats} мест</TableSeats>
      </DragHandle>

      {onRotate && (
        <RotateButton
          onClick={handleRotate}
          title="Повернуть на 45°"
        >
          <RotateCw size={14} />
        </RotateButton>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div<{
  $shape: string;
  $isSelected: boolean;
  $isDragging: boolean;
}>`
  position: absolute;
  background: ${(props) =>
    props.$isSelected ? theme.colors.primary[500] : theme.colors.gray[100]};
  border: 3px solid
    ${(props) => (props.$isSelected ? theme.colors.primary[700] : theme.colors.gray[300])};
  color: ${(props) => (props.$isSelected ? 'white' : theme.colors.text.primary)};
  user-select: none;
  transition: all ${theme.transitions.fast};
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  box-shadow: ${(props) => (props.$isSelected ? theme.shadows.lg : 'none')};
  transform: ${(props) => (props.$isSelected ? 'scale(1.05)' : 'scale(1)')};
  z-index: ${(props) => (props.$isSelected ? 20 : 1)};

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

  &:hover {
    border-color: ${(props) =>
      props.$isSelected ? theme.colors.primary[800] : theme.colors.primary[400]};
    box-shadow: ${theme.shadows.md};
    z-index: 10;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const DragHandle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[1]};
  width: 100%;
  height: 100%;
  cursor: ${(props) => props.style?.cursor || 'grab'};

  &:active {
    cursor: grabbing;
  }
`;

const TableNumber = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  pointer-events: none;
`;

const TableSeats = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  opacity: 0.8;
  pointer-events: none;
`;

const RotateButton = styled.button`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary[500]};
  border: 2px solid white;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all ${theme.transitions.fast};
  z-index: 100;
  box-shadow: ${theme.shadows.md};
  touch-action: none;
  user-select: none;

  &:hover {
    background: ${theme.colors.primary[600]};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  ${Container}:hover & {
    opacity: 1;
  }
`;
