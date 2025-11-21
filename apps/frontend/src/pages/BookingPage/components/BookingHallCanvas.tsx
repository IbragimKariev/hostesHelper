import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { BookingTableItem } from './BookingTableItem';
import type { Hall, Reservation, Wall } from '@hostes/shared';

interface BookingHallCanvasProps {
  hall: Hall;
  reservations: Reservation[];
  selectedDate: string;
  onTableClick: (tableId: string) => void;
}

// Компонент для отрисовки стены/окна/входа
const WallLine = ({
  wall,
  pixelRatio,
}: {
  wall: Wall;
  pixelRatio: number;
}) => {
  const x1 = wall.start.x * pixelRatio;
  const y1 = wall.start.y * pixelRatio;
  const x2 = wall.end.x * pixelRatio;
  const y2 = wall.end.y * pixelRatio;

  let stroke: string = theme.colors.gray[800];
  let strokeWidth = 6;
  let strokeDasharray: string | 'none' = 'none';

  if (wall.wallType === 'window') {
    stroke = theme.colors.primary[500];
    strokeWidth = 4;
    strokeDasharray = '10 5';
  } else if (wall.wallType === 'entrance') {
    stroke = theme.colors.success[500];
    strokeWidth = 8;
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
    />
  );
};

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
        new Date(r.date).toISOString().split('T')[0] === selectedDate &&
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

        {/* Стены, окна, входы */}
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
          width={hall.width * hall.pixelRatio}
          height={hall.height * hall.pixelRatio}
        >
          {hall.walls?.map((wall) => (
            <WallLine key={wall.id} wall={wall} pixelRatio={hall.pixelRatio} />
          ))}
        </svg>

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
        <LegendDivider />
        <LegendItem>
          <WallLegendLine $color={theme.colors.gray[800]} />
          <LegendText>Стена</LegendText>
        </LegendItem>
        <LegendItem>
          <WallLegendLine $color={theme.colors.primary[500]} $dashed />
          <LegendText>Окно</LegendText>
        </LegendItem>
        <LegendItem>
          <WallLegendLine $color={theme.colors.success[500]} $thick />
          <LegendText>Вход</LegendText>
        </LegendItem>
      </Legend>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
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

const LegendDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${theme.colors.divider};
  margin: 0 ${theme.spacing[2]};
`;

const WallLegendLine = styled.div<{ $color: string; $dashed?: boolean; $thick?: boolean }>`
  width: 24px;
  height: ${(props) => (props.$thick ? '4px' : '2px')};
  background: ${(props) => props.$color};
  border-radius: 1px;
  ${(props) =>
    props.$dashed &&
    `
    background-image: linear-gradient(90deg, ${props.$color} 60%, transparent 60%);
    background-size: 8px 100%;
  `}
`;
