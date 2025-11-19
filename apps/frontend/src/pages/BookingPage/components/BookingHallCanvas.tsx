import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { BookingTableItem } from './BookingTableItem';
import type { Hall, Reservation } from '@hostes/shared';

interface BookingHallCanvasProps {
  hall: Hall;
  reservations: Reservation[];
  selectedDate: string;
  onTableClick: (tableId: string) => void;
}

export const BookingHallCanvas = ({
  hall,
  reservations,
  selectedDate,
  onTableClick,
}: BookingHallCanvasProps) => {
  const tables = hall.tables || [];
  const availableCount = tables.filter((table) => {
    const tableReservations = reservations.filter(
      (r) =>
        r.tableId === table.id &&
        r.date === selectedDate &&
        (r.status === 'confirmed' || r.status === 'pending')
    );
    return tableReservations.length === 0;
  }).length;

  return (
    <Container>
      <CanvasHeader>
        <CanvasTitle>{hall.name}</CanvasTitle>
        <CanvasInfo>
          <InfoBadge $type="available">
            {availableCount} свободно
          </InfoBadge>
          <InfoBadge $type="reserved">
            {tables.length - availableCount} занято
          </InfoBadge>
        </CanvasInfo>
      </CanvasHeader>

      <Canvas
        $width={hall.width * hall.pixelRatio}
        $height={hall.height * hall.pixelRatio}
      >
        <Grid $pixelRatio={hall.pixelRatio} />

        {tables.map((table) => (
          <BookingTableItem
            key={table.id}
            table={table}
            reservations={reservations}
            selectedDate={selectedDate}
            pixelRatio={hall.pixelRatio}
            onClick={() => onTableClick(table.id)}
          />
        ))}
      </Canvas>

      <Legend>
        <LegendItem>
          <LegendColor $color={theme.colors.success[400]} />
          <LegendText>Доступен</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.gray[500]} />
          <LegendText>Забронирован</LegendText>
        </LegendItem>
      </Legend>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const CanvasHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const CanvasTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const CanvasInfo = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const InfoBadge = styled.div<{ $type: 'available' | 'reserved' }>`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  background: ${(props) =>
    props.$type === 'available' ? theme.colors.success[100] : theme.colors.gray[100]};
  color: ${(props) =>
    props.$type === 'available' ? theme.colors.success[700] : theme.colors.gray[700]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Canvas = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  background: white;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
`;

const Grid = styled.div<{ $pixelRatio: number }>`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(${theme.colors.gray[200]} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.colors.gray[200]} 1px, transparent 1px);
  background-size: ${(props) => props.$pixelRatio}px ${(props) => props.$pixelRatio}px;
  pointer-events: none;
`;

const Legend = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.$color};
  border: 2px solid ${(props) => props.$color};
  border-radius: ${theme.borderRadius.sm};
`;

const LegendText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;
