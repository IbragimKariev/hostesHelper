import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Modal, Button, Input } from '@/components/ui';
import type { CreateHallDto } from '@hostes/shared';

interface CreateHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateHallDto) => void;
  isLoading?: boolean;
}

export const CreateHallModal = ({ isOpen, onClose, onCreate, isLoading }: CreateHallModalProps) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState('12');
  const [height, setHeight] = useState('8');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreate({
      name: name.trim() || 'Новый зал',
      width: parseFloat(width) || 12,
      height: parseFloat(height) || 8,
      pixelRatio: 50,
      sections: [],
      walls: [],
    });

    // Reset form
    setName('');
    setWidth('12');
    setHeight('8');
  };

  const handleClose = () => {
    setName('');
    setWidth('12');
    setHeight('8');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать новый зал"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Создать зал
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

const HelpText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;
