import styled from 'styled-components';
import { theme } from '@/styles/theme';
import type { Table, Reservation } from '@hostes/shared';

interface BookingTableItemProps {
  table: Table;
  reservations: Reservation[];
  selectedDate: string;
  selectedTime?: string;
  pixelRatio: number;
  onClick: () => void;
}

export const BookingTableItem = ({
  table,
  reservations,
  selectedDate,
  pixelRatio,
  onClick,
}: BookingTableItemProps) => {
  // Проверяем, забронирован ли столик на выбранную дату
  const tableReservations = reservations.filter((r) => {
    return (
      r.tableId === table.id &&
      new Date(r.date).toISOString().split('T')[0] === selectedDate &&
      (r.status === 'confirmed' || r.status === 'pending')
    );
  });

  const isReserved = tableReservations.length > 0;
  const status = isReserved ? 'reserved' : 'available';

  const style = {
    transform: `rotate(${table.rotation}deg)`,
    left: `${table.position.x * pixelRatio}px`,
    top: `${table.position.y * pixelRatio}px`,
    width: `${table.size.width * pixelRatio}px`,
    height: `${table.size.height * pixelRatio}px`,
  };

  return (
    <Container
      style={style}
      $shape={table.shape}
      $status={status}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Столик номер ${table.number}, ${table.seats} мест, ${isReserved ? 'забронирован' : 'доступен'}`}
    >
      <TableNumber>{table.number}</TableNumber>
      <TableSeats>{table.seats} мест</TableSeats>
      {isReserved && (
        <ReservationBadge>
          {tableReservations.length} {tableReservations.length === 1 ? 'бронь' : 'брони'}
        </ReservationBadge>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div<{
  $shape: string;
  $status: 'available' | 'reserved';
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[1]};
  background: ${(props) =>
    props.$status === 'available' ? theme.colors.success[100] : theme.colors.gray[300]};
  border: 3px solid
    ${(props) => (props.$status === 'available' ? theme.colors.success[400] : theme.colors.gray[500])};
  color: ${(props) =>
    props.$status === 'available' ? theme.colors.success[900] : theme.colors.gray[700]};
  cursor: ${(props) => (props.$status === 'available' ? 'pointer' : 'not-allowed')};
  user-select: none;
  transition: all ${theme.transitions.fast};
  opacity: ${(props) => (props.$status === 'available' ? 1 : 0.6)};

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
      props.$status === 'available' ? theme.colors.success[600] : theme.colors.gray[600]};
    box-shadow: ${theme.shadows.md};
    z-index: 10;
  }

  &:hover:not(:disabled) {
    transform: ${(props) => (props.$status === 'available' ? 'scale(1.05)' : 'scale(1)')};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
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

const ReservationBadge = styled.div`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${theme.colors.warning[500]};
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.full};
  white-space: nowrap;
  box-shadow: ${theme.shadows.sm};
`;
