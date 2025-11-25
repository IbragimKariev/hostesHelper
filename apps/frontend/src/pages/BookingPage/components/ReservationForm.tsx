import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Button, Input, Select, Modal } from '@/components/ui';
import { useCreateReservation, useUpdateReservation, useReservations } from '@/hooks/useReservations';
import type { Reservation, CreateReservationDto } from '@hostes/shared';
import { X, AlertTriangle } from 'lucide-react';

interface ReservationFormProps {
  onClose: () => void;
  hallId: string;
  tables: Array<{ id: string; number: number; seats: number }>;
  defaultDate?: string;
  defaultTime?: string;
  defaultTableId?: string;
  reservation?: Reservation; // Для редактирования
}

export const ReservationForm = ({
  onClose,
  hallId,
  tables,
  defaultDate,
  defaultTime,
  defaultTableId,
  reservation,
}: ReservationFormProps) => {
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingReservations, setConflictingReservations] = useState<Reservation[]>([]);

  // Функция для форматирования даты в YYYY-MM-DD (для input type="date")
  const formatDateToYYYYMMDD = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Функция для преобразования YYYY-MM-DD в Date объект
  const convertToDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: reservation
      ? {
          tableId: reservation.tableId,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          guests: reservation.guests,
          date: formatDateToYYYYMMDD(reservation.date),
          time: reservation.time,
          duration: reservation.duration,
          status: reservation.status,
          specialRequests: reservation.specialRequests || '',
        }
      : {
          tableId: defaultTableId || '',
          customerName: '',
          customerPhone: '',
          guests: 2,
          date: defaultDate || new Date().toISOString().split('T')[0],
          time: defaultTime || '19:00',
          duration: 2,
          status: 'pending' as const,
          specialRequests: '',
        },
  });

  const selectedTableId = watch('tableId');
  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedDuration = watch('duration');
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Получить все бронирования для выбранной даты
  const { data: allReservations } = useReservations({ date: selectedDate, hallId });

  // Проверка конфликтов при изменении данных формы
  useEffect(() => {
    if (!selectedTableId || !selectedDate || !selectedTime || !selectedDuration) {
      setConflictingReservations([]);
      return;
    }

    const [startHour, startMinute] = selectedTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = startTimeMinutes + Number(selectedDuration) * 60;

    const conflicts = (allReservations || []).filter((r) => {
      if (reservation && r.id === reservation.id) return false;
      if (r.tableId !== selectedTableId) return false;
      if (r.status === 'cancelled') return false;

      const [rHour, rMinute] = r.time.split(':').map(Number);
      const rStartMinutes = rHour * 60 + rMinute;
      const rEndMinutes = rStartMinutes + r.duration * 60;

      const hasOverlap =
        (startTimeMinutes >= rStartMinutes && startTimeMinutes < rEndMinutes) ||
        (endTimeMinutes > rStartMinutes && endTimeMinutes <= rEndMinutes) ||
        (startTimeMinutes <= rStartMinutes && endTimeMinutes >= rEndMinutes);

      return hasOverlap;
    });

    setConflictingReservations(conflicts);
    if (conflicts.length > 0) {
      setShowConflictModal(true);
    }
  }, [selectedTableId, selectedDate, selectedTime, selectedDuration, allReservations, reservation]);

  const onSubmit = async (data: any) => {
    if (conflictingReservations.length > 0 && !reservation) {
      setShowConflictModal(true);
      return;
    }
    try {
      const formData: CreateReservationDto = {
        tableId: data.tableId,
        hallId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guests: parseInt(data.guests),
        date: convertToDate(data.date), // Преобразуем YYYY-MM-DD в Date объект
        time: data.time,
        duration: parseFloat(data.duration),
        status: data.status,
        specialRequests: data.specialRequests || undefined,
      };

      if (reservation) {
        await updateReservation.mutateAsync({
          id: reservation.id,
          data: formData,
        });
      } else {
        await createReservation.mutateAsync(formData);
      }

      onClose();
    } catch (error) {
      console.error('Form error:', error);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const hasConflict = conflictingReservations.length > 0;

  return (
    <>
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader>
        <FormTitle>{reservation ? 'Редактировать бронирование' : 'Новое бронирование'}</FormTitle>
        <CloseButton onClick={onClose} type="button">
          <X size={20} />
        </CloseButton>
      </FormHeader>

      {hasConflict && !reservation && (
        <ConflictWarning>
          <AlertTriangle size={20} />
          <div>
            <ConflictTitle>Столик занят!</ConflictTitle>
            <ConflictText>
              На выбранное время уже есть {conflictingReservations.length}{' '}
              {conflictingReservations.length === 1 ? 'бронирование' : 'бронирований'}. Выберите другое время или столик.
            </ConflictText>
          </div>
        </ConflictWarning>
      )}

      <FormContent>
        <FormRow>
          <Select
            label="Столик"
            fullWidth
            error={errors.tableId?.message}
            {...register('tableId', { required: 'Выберите столик' })}
          >
            <option value="">Выберите столик</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                Столик №{table.number} ({table.seats} мест)
              </option>
            ))}
          </Select>

          <Input
            label="Количество гостей"
            type="number"
            min={1}
            max={selectedTable?.seats || 20}
            error={errors.guests?.message}
            helperText={selectedTable ? `Максимум ${selectedTable.seats} мест` : undefined}
            {...register('guests', {
              required: 'Укажите количество гостей',
              min: { value: 1, message: 'Минимум 1 гость' },
              max: {
                value: selectedTable?.seats || 20,
                message: `Максимум ${selectedTable?.seats || 20} гостей`,
              },
            })}
          />
        </FormRow>

        <FormRow>
          <Input
            label="Дата"
            type="date"
            min={minDate}
            error={errors.date?.message}
            {...register('date', { required: 'Выберите дату' })}
          />

          <Input
            label="Время"
            type="time"
            error={errors.time?.message}
            {...register('time', { required: 'Выберите время' })}
          />

          <Select
            label="Длительность"
            error={errors.duration?.message}
            {...register('duration', { required: 'Выберите длительность' })}
          >
            <option value="1">1 час</option>
            <option value="1.5">1.5 часа</option>
            <option value="2">2 часа</option>
            <option value="2.5">2.5 часа</option>
            <option value="3">3 часа</option>
            <option value="4">4 часа</option>
          </Select>
        </FormRow>

        <Divider />

        <FormRow>
          <Input
            label="Имя гостя"
            placeholder="Иван Иванов"
            error={errors.customerName?.message}
            {...register('customerName', {
              required: 'Введите имя',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            })}
          />

          <Input
            label="Телефон"
            type="tel"
            placeholder="+996 (555) 123-456"
            error={errors.customerPhone?.message}
            {...register('customerPhone', {
              required: 'Введите телефон',
              pattern: {
                value: /^(\+996|996|0)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{3}$/,
                message: 'Неверный формат телефона. Пример: +996 (555) 123-456',
              },
            })}
          />
        </FormRow>

        <Select
          label="Статус"
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="pending">В ожидании</option>
          <option value="confirmed">Подтверждено</option>
          <option value="cancelled">Отменено</option>
          <option value="completed">Завершено</option>
        </Select>

        <Textarea
          label="Особые пожелания"
          placeholder="Например: у окна, детское кресло, день рождения..."
          error={errors.specialRequests?.message}
          {...register('specialRequests')}
        />
      </FormContent>

      <FormFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={hasConflict && !reservation}>
          {reservation ? 'Сохранить' : 'Создать бронирование'}
        </Button>
      </FormFooter>
    </Form>

    <Modal isOpen={showConflictModal} onClose={() => setShowConflictModal(false)} title="Столик занят" size="sm">
      <ConflictModalContent>
        <ConflictModalIcon>
          <AlertTriangle size={48} color="#ef4444" />
        </ConflictModalIcon>
        <ConflictModalText>
          На выбранное время столик №{selectedTable?.number} уже забронирован:
        </ConflictModalText>
        <ConflictList>
          {conflictingReservations.map((r) => (
            <ConflictItem key={r.id}>
              <ConflictTime>{r.time} ({r.duration}ч)</ConflictTime>
              <ConflictCustomer>{r.customerName}</ConflictCustomer>
              <ConflictStatus $status={r.status}>
                {r.status === 'confirmed' && 'Подтверждено'}
                {r.status === 'pending' && 'Ожидание'}
              </ConflictStatus>
            </ConflictItem>
          ))}
        </ConflictList>
        <ConflictModalActions>
          <Button variant="primary" onClick={() => setShowConflictModal(false)} fullWidth>
            Понятно
          </Button>
        </ConflictModalActions>
      </ConflictModalContent>
    </Modal>
    </>
  );
};

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  width: 100%;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.divider};
`;

interface TextareaProps {
  label?: string;
  error?: string;
}

const TextareaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const TextareaLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const StyledTextarea = styled.textarea<{ $hasError: boolean }>`
  width: 100%;
  min-height: 80px;
  padding: ${theme.spacing[3]};
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background: white;
  border: 1px solid ${(props) => (props.$hasError ? theme.colors.error[500] : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  resize: vertical;
  transition: all ${theme.transitions.fast};

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.$hasError ? theme.colors.error[600] : theme.colors.gray[400])};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? theme.colors.error[500] : theme.colors.primary[500])};
    box-shadow: 0 0 0 3px
      ${(props) => (props.$hasError ? theme.colors.error[100] : theme.colors.primary[100])};
  }

  &:disabled {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error[600]};
`;

// Textarea component
const Textarea = ({ label, error, ...props }: TextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <TextareaWrapper>
      {label && <TextareaLabel>{label}</TextareaLabel>}
      <StyledTextarea $hasError={!!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </TextareaWrapper>
  );
};

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.divider};

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

// Conflict Warning Styles
const ConflictWarning = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-left: 4px solid ${theme.colors.error[500]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.error[700]};
`;

const ConflictTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[1]};
`;

const ConflictText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
`;

// Conflict Modal Styles
const ConflictModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  align-items: center;
  text-align: center;
  padding: ${theme.spacing[4]} 0;
`;

const ConflictModalIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConflictModalText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const ConflictList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const ConflictItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]};
  background: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border-left: 3px solid ${theme.colors.error[500]};
`;

const ConflictTime = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const ConflictCustomer = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ConflictStatus = styled.div<{ $status: string }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props) =>
    props.$status === 'confirmed' ? theme.colors.success[600] : theme.colors.warning[600]};
`;

const ConflictModalActions = styled.div`
  width: 100%;
  display: flex;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[2]};
`;
