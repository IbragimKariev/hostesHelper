import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Modal, Button, Input, Select } from '@/components/ui';
import { Square, Circle } from 'lucide-react';
import type { Table, UpdateTableDto } from '@hostes/shared';

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateTableDto) => void;
  table: Table | null;
  isLoading?: boolean;
}

const seatOptions = [2, 4, 6, 8, 10, 12];

const statusOptions = [
  { value: 'available', label: 'Доступен' },
  { value: 'occupied', label: 'Занят' },
  { value: 'reserved', label: 'Забронирован' },
  { value: 'cleaning', label: 'Уборка' },
];

export const EditTableModal = ({ isOpen, onClose, onUpdate, table, isLoading }: EditTableModalProps) => {
  const [seats, setSeats] = useState(4);
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'oval'>('rectangle');
  const [status, setStatus] = useState<'available' | 'occupied' | 'reserved' | 'cleaning'>('available');
  const [rotation, setRotation] = useState('0');

  useEffect(() => {
    if (table) {
      setSeats(table.seats);
      setShape(table.shape as 'rectangle' | 'circle' | 'oval');
      setStatus(table.status as 'available' | 'occupied' | 'reserved' | 'cleaning');
      setRotation(table.rotation.toString());
    }
  }, [table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!table) return;

    // Размер столика в зависимости от количества мест
    const getTableSize = (seats: number) => {
      if (seats <= 2) return { width: 0.8, height: 0.8 };
      if (seats <= 4) return { width: 1.2, height: 1.2 };
      if (seats <= 6) return { width: 1.5, height: 1.5 };
      if (seats <= 8) return { width: 2.0, height: 1.0 };
      return { width: 2.5, height: 2.5 };
    };

    const newSize = getTableSize(seats);

    onUpdate({
      seats,
      shape,
      status,
      rotation: parseFloat(rotation) || 0,
      size: newSize,
    });
  };

  if (!table) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Редактировать столик №${table.number}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Сохранить
          </Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Количество мест</Label>
          <SeatsGrid>
            {seatOptions.map((seatOption) => (
              <SeatButton
                key={seatOption}
                type="button"
                $active={seats === seatOption}
                onClick={() => setSeats(seatOption)}
              >
                {seatOption}
              </SeatButton>
            ))}
          </SeatsGrid>
        </FormGroup>

        <FormGroup>
          <Label>Форма столика</Label>
          <ShapeButtons>
            <ShapeButton
              type="button"
              $active={shape === 'rectangle'}
              onClick={() => setShape('rectangle')}
              title="Прямоугольный"
            >
              <Square size={20} />
              <span>Прямоугольный</span>
            </ShapeButton>
            <ShapeButton
              type="button"
              $active={shape === 'circle'}
              onClick={() => setShape('circle')}
              title="Круглый"
            >
              <Circle size={20} />
              <span>Круглый</span>
            </ShapeButton>
            <ShapeButton
              type="button"
              $active={shape === 'oval'}
              onClick={() => setShape('oval')}
              title="Овальный"
            >
              <OvalIcon />
              <span>Овальный</span>
            </ShapeButton>
          </ShapeButtons>
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="status">Статус</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'available' | 'occupied' | 'reserved' | 'cleaning')}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="rotation">Поворот (градусы)</Label>
            <Input
              id="rotation"
              type="number"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
              min="0"
              max="360"
              step="15"
            />
          </FormGroup>
        </FormRow>

        <InfoBox>
          <InfoLabel>Позиция:</InfoLabel>
          <InfoValue>
            X: {table.position.x.toFixed(1)}м, Y: {table.position.y.toFixed(1)}м
          </InfoValue>
        </InfoBox>
      </Form>
    </Modal>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[5]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const SeatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing[2]};
`;

const SeatButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing[3]};
  border: 2px solid
    ${(props) => (props.$active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${(props) => (props.$active ? theme.colors.primary[500] : 'white')};
  color: ${(props) => (props.$active ? 'white' : theme.colors.text.primary)};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$active ? theme.colors.primary[600] : theme.colors.gray[50]};
    border-color: ${(props) =>
      props.$active ? theme.colors.primary[600] : theme.colors.gray[300]};
  }
`;

const ShapeButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing[2]};
`;

const ShapeButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]};
  border: 2px solid
    ${(props) => (props.$active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'white')};
  color: ${(props) => (props.$active ? theme.colors.primary[600] : theme.colors.text.secondary)};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.sm};

  &:hover {
    background: ${(props) =>
      props.$active ? theme.colors.primary[100] : theme.colors.gray[50]};
    border-color: ${(props) =>
      props.$active ? theme.colors.primary[600] : theme.colors.gray[300]};
  }
`;

const OvalIcon = styled.div`
  width: 24px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
`;

const InfoBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;
