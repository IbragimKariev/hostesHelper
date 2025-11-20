import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Square, Circle } from 'lucide-react';

export type TableShape = 'rectangle' | 'circle' | 'oval';
export type ToolMode = 'select' | 'add-table' | 'add-wall' | 'add-window' | 'add-entrance';

interface ToolbarProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  selectedShape: TableShape;
  onShapeChange: (shape: TableShape) => void;
  selectedSeats: number;
  onSeatsChange: (seats: number) => void;
}

const seatOptions = [2, 4, 6, 8, 10, 12];

export const Toolbar = ({
  mode,
  onModeChange,
  selectedShape,
  onShapeChange,
  selectedSeats,
  onSeatsChange,
}: ToolbarProps) => {
  return (
    <Container>
      <Section>
        <SectionTitle>Режим</SectionTitle>
        <ToolButtons>
          <ToolButton $active={mode === 'select'} onClick={() => onModeChange('select')}>
            <span>👆</span>
            <span>Выбор</span>
          </ToolButton>
          <ToolButton $active={mode === 'add-table'} onClick={() => onModeChange('add-table')}>
            <Square size={16} />
            <span>Столик</span>
          </ToolButton>
          <ToolButton $active={mode === 'add-wall'} onClick={() => onModeChange('add-wall')}>
            <span>🧱</span>
            <span>Стена</span>
          </ToolButton>
          <ToolButton $active={mode === 'add-window'} onClick={() => onModeChange('add-window')}>
            <span>🪟</span>
            <span>Окно</span>
          </ToolButton>
          <ToolButton $active={mode === 'add-entrance'} onClick={() => onModeChange('add-entrance')}>
            <span>🚪</span>
            <span>Вход</span>
          </ToolButton>
        </ToolButtons>
      </Section>

      {mode === 'add-table' && (
        <>
          <Divider />
          <Section>
            <SectionTitle>Форма столика</SectionTitle>
            <ShapeButtons>
              <ShapeButton
                $active={selectedShape === 'rectangle'}
                onClick={() => onShapeChange('rectangle')}
                title="Прямоугольный"
              >
                <Square size={20} />
              </ShapeButton>
              <ShapeButton
                $active={selectedShape === 'circle'}
                onClick={() => onShapeChange('circle')}
                title="Круглый"
              >
                <Circle size={20} />
              </ShapeButton>
              <ShapeButton
                $active={selectedShape === 'oval'}
                onClick={() => onShapeChange('oval')}
                title="Овальный"
              >
                <OvalIcon />
              </ShapeButton>
            </ShapeButtons>
          </Section>

          <Divider />
          <Section>
            <SectionTitle>Количество мест</SectionTitle>
            <SeatsGrid>
              {seatOptions.map((seats) => (
                <SeatButton
                  key={seats}
                  $active={selectedSeats === seats}
                  onClick={() => onSeatsChange(seats)}
                >
                  {seats}
                </SeatButton>
              ))}
            </SeatsGrid>
          </Section>
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const SectionTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ToolButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const ToolButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'white')};
  color: ${(props) => (props.$active ? theme.colors.primary[700] : theme.colors.text.primary)};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$active ? theme.colors.primary[100] : theme.colors.gray[50]};
    border-color: ${(props) =>
      props.$active ? theme.colors.primary[600] : theme.colors.gray[300]};
  }

  svg {
    flex-shrink: 0;
  }
`;

const ShapeButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const ShapeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid
    ${(props) => (props.$active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${(props) => (props.$active ? theme.colors.primary[50] : 'white')};
  color: ${(props) => (props.$active ? theme.colors.primary[600] : theme.colors.text.secondary)};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

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

const SeatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing[2]};
`;

const SeatButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing[2]};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${(props) => (props.$active ? theme.colors.primary[500] : 'white')};
  color: ${(props) => (props.$active ? 'white' : theme.colors.text.primary)};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
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

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.divider};
`;
