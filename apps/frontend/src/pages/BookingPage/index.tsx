import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Card, CardHeader, Button, PageSpinner, Modal } from '@/components/ui';
import { useHalls } from '@/hooks/useHalls';
import { useReservations, useCancelReservation } from '@/hooks/useReservations';
import { Calendar, Clock, Users, Phone, FileText, Filter } from 'lucide-react';
import { ReservationForm } from './components/ReservationForm';
import { BookingHallCanvas } from './components/BookingHallCanvas';
import type { Reservation } from '@hostes/shared';

export const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const cancelReservation = useCancelReservation();

  const { data: halls, isLoading: hallsLoading } = useHalls();
  const { data: reservations, isLoading: reservationsLoading } = useReservations({
    date: selectedDate.toISOString().split('T')[0],
    hallId: selectedHallId || undefined,
  });

  const isLoading = hallsLoading || reservationsLoading;

  // Автоматически выбрать первый зал
  if (halls && halls.length > 0 && !selectedHallId) {
    setSelectedHallId(halls[0].id);
  }

  if (isLoading) {
    return <PageSpinner />;
  }

  const selectedHall = halls?.find((h) => h.id === selectedHallId);

  // Группировка бронирований по статусу
  const confirmedCount = reservations?.filter((r) => r.status === 'confirmed').length || 0;
  const pendingCount = reservations?.filter((r) => r.status === 'pending').length || 0;
  const cancelledCount = reservations?.filter((r) => r.status === 'cancelled').length || 0;

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Бронирование</Title>
          <Subtitle>Управление бронированиями столиков</Subtitle>
        </HeaderContent>
        <Button leftIcon={<Calendar size={20} />} onClick={() => {
          setEditingReservation(null);
          setIsFormOpen(true);
        }}>
          Новое бронирование
        </Button>
      </Header>

      <Controls>
        <ControlGroup>
          <Label>
            <Calendar size={16} />
            Дата
          </Label>
          <DateInput
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </ControlGroup>

        <ControlGroup>
          <Label>
            <Filter size={16} />
            Зал
          </Label>
          <Select value={selectedHallId} onChange={(e) => setSelectedHallId(e.target.value)}>
            {halls?.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </Select>
        </ControlGroup>
      </Controls>

      <StatsBar>
        <StatCard $color={theme.colors.success[500]}>
          <StatValue>{confirmedCount}</StatValue>
          <StatLabel>Подтверждено</StatLabel>
        </StatCard>
        <StatCard $color={theme.colors.warning[500]}>
          <StatValue>{pendingCount}</StatValue>
          <StatLabel>В ожидании</StatLabel>
        </StatCard>
        <StatCard $color={theme.colors.error[500]}>
          <StatValue>{cancelledCount}</StatValue>
          <StatLabel>Отменено</StatLabel>
        </StatCard>
        <StatCard $color={theme.colors.primary[500]}>
          <StatValue>{reservations?.length || 0}</StatValue>
          <StatLabel>Всего</StatLabel>
        </StatCard>
      </StatsBar>

      <Content>
        <ReservationsList>
          <Card >
            <CardHeaderPadded>
              <CardHeader
                title="Бронирования"
                subtitle={`${reservations?.length || 0} бронирований на ${selectedDate.toLocaleDateString('ru-RU')}`}
              />
            </CardHeaderPadded>

            {reservations && reservations.length > 0 ? (
              <ReservationsTable>
                {reservations.map((reservation) => (
                  <ReservationRow key={reservation.id} $status={reservation.status}>
                    <div>
<ReservationTime>
                      <Clock size={16} />
                      <TimeText>{reservation.time}</TimeText>
                      <Duration>{reservation.duration}ч</Duration>
                    </ReservationTime>

                    <ReservationInfo>
                      <CustomerName>{reservation.customerName}</CustomerName>
                      <ReservationMeta>
                        <MetaItem>
                          <Phone size={14} />
                          {reservation.customerPhone}
                        </MetaItem>
                        <MetaItem>
                          <Users size={14} />
                          {reservation.guests} {reservation.guests === 1 ? 'гость' : 'гостей'}
                        </MetaItem>
                        <MetaItem>
                          <FileText size={14} />
                          Стол №{reservation.tableNumber}
                        </MetaItem>
                      </ReservationMeta>
                      {reservation.specialRequests && (
                        <SpecialRequests>{reservation.specialRequests}</SpecialRequests>
                      )}
                    </ReservationInfo>
                    </div>
                    

                    <ReservationStatus $status={reservation.status}>
                      {reservation.status === 'confirmed' && '✓ Подтверждено'}
                      {reservation.status === 'pending' && '⏱ Ожидание'}
                      {reservation.status === 'cancelled' && '✕ Отменено'}
                      {reservation.status === 'completed' && '✓ Завершено'}
                    </ReservationStatus>

                    <ReservationActions>
                      <ActionButton onClick={() => {
                        setEditingReservation(reservation);
                        setIsFormOpen(true);
                      }}>
                        Изменить
                      </ActionButton>
                      <ActionButton
                        $danger
                        onClick={() => {
                          if (window.confirm('Отменить бронирование?')) {
                            cancelReservation.mutate(reservation.id);
                          }
                        }}
                      >
                        Отменить
                      </ActionButton>
                    </ReservationActions>
                  </ReservationRow>
                ))}
              </ReservationsTable>
            ) : (
              <EmptyState>
                <EmptyIcon>📅</EmptyIcon>
                <EmptyTitle>Нет бронирований</EmptyTitle>
                <EmptyText>На выбранную дату нет бронирований</EmptyText>
              </EmptyState>
            )}
          </Card>
        </ReservationsList>

        <HallBar>
          <Card >
            {selectedHall ? (
              <BookingHallCanvas
                hall={selectedHall}
                reservations={reservations || []}
                selectedDate={selectedDate.toISOString().split('T')[0]}
                onTableClick={(tableId) => {
                  setSelectedTableId(tableId);
                  setEditingReservation(null);
                  setIsFormOpen(true);
                }}
              />
            ) : (
              <>
                <CardHeader title="План зала" subtitle="Выберите зал" />
                <HallPreview>
                  <HallPlaceholder>
                    <PreviewIcon>🏛️</PreviewIcon>
                    <PreviewText>Выберите зал для просмотра</PreviewText>
                  </HallPlaceholder>
                </HallPreview>
              </>
            )}
          </Card>
        </HallBar>
      </Content>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTableId('');
        }}
      >
        <ReservationForm
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTableId('');
          }}
          hallId={selectedHallId}
          tables={selectedHall?.tables || []}
          defaultDate={selectedDate.toISOString().split('T')[0]}
          defaultTableId={selectedTableId}
          reservation={editingReservation || undefined}
        />
      </Modal>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
`;

const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
`;

const DateInput = styled.input`
  height: 40px;
  padding: 0 ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Select = styled.select`
  height: 40px;
  padding: 0 ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  background: white;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.gray[400]};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing[4]};
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-left: 4px solid ${(props) => props.$color};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const Content = styled.div`
  display: flex;
  gap: ${theme.spacing[6]};
`;

const ReservationsList = styled.div`
  width: 50%;
  min-width: 320px;
`;

const CardHeaderPadded = styled.div`
  padding: ${theme.spacing[4]};
  padding-bottom: 0;
`;

const ReservationsTable = styled.div`
  display: flex;
  flex-direction: column;
`;

const statusColors = {
  confirmed: theme.colors.success[500],
  pending: theme.colors.warning[500],
  cancelled: theme.colors.error[500],
  completed: theme.colors.gray[500],
};

const ReservationRow = styled.div<{ $status: string }>`
  display:flex;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.divider};
  border-left: 3px solid ${(props) => statusColors[props.$status as keyof typeof statusColors]};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.surface};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ReservationTime = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  color: ${theme.colors.text.secondary};
`;

const TimeText = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const Duration = styled.div`
  font-size: ${theme.typography.fontSize.xs};
`;

const ReservationInfo = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};
  min-width: 0;
`;

const CustomerName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReservationMeta = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const SpecialRequests = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-style: italic;
`;

const ReservationStatus = styled.div<{ $status: string }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) => statusColors[props.$status as keyof typeof statusColors]};
`;

const ReservationActions = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};

  transition: opacity ${theme.transitions.fast};
  flex-shrink: 0;

 
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border: 1px solid ${(props) => (props.$danger ? theme.colors.error[500] : theme.colors.border)};
  background: white;
  color: ${(props) => (props.$danger ? theme.colors.error[600] : theme.colors.text.primary)};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${(props) => (props.$danger ? theme.colors.error[50] : theme.colors.gray[50])};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[12]};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
`;

const EmptyTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const EmptyText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

const HallBar = styled.div`
  width: 50%;
  flex: 1;
`;

const HallPreview = styled.div`
  margin-top: ${theme.spacing[4]};
  aspect-ratio: 1;
  background: ${theme.colors.surface};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HallPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const PreviewIcon = styled.div`
  font-size: 48px;
`;

const PreviewText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;
