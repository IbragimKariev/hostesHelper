import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Modal, Button, Input } from '@/components/ui';
import type { Hall, UpdateHallDto } from '@hostes/shared';

interface EditHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateHallDto) => void;
  hall: Hall | null;
  isLoading?: boolean;
}

export const EditHallModal = ({ isOpen, onClose, onUpdate, hall, isLoading }: EditHallModalProps) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState('12');
  const [height, setHeight] = useState('8');

  useEffect(() => {
    if (hall) {
      setName(hall.name);
      setWidth(hall.width.toString());
      setHeight(hall.height.toString());
    }
  }, [hall]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hall) return;

    onUpdate({
      name: name.trim() || 'Новый зал',
      width: parseFloat(width) || 12,
      height: parseFloat(height) || 8,
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!hall) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Редактировать зал: ${hall.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
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
          <Label htmlFor="hallName">Название зала</Label>
          <Input
            id="hallName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Основной зал"
            autoFocus
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="hallWidth">Ширина (метры)</Label>
            <Input
              id="hallWidth"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              min="4"
              max="50"
              step="0.5"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="hallHeight">Высота (метры)</Label>
            <Input
              id="hallHeight"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="4"
              max="50"
              step="0.5"
            />
          </FormGroup>
        </FormRow>

        <InfoBox>
          <InfoLabel>Количество столиков:</InfoLabel>
          <InfoValue>{hall.tables?.length || 0}</InfoValue>
        </InfoBox>

        <HelpText>
          Размеры указываются в метрах. Рекомендуемые размеры: 8-20 метров.
        </HelpText>
      </Form>
    </Modal>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
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

const HelpText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;
