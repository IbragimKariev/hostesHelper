# Hostes Frontend

Современный React-интерфейс для системы бронирования столиков.

## Технологии

- **React 19** - UI библиотека
- **Vite** - сборщик и dev server
- **TypeScript** - типизация
- **React Router v6** - роутинг
- **React Query** - управление серверным состоянием
- **styled-components** - CSS-in-JS
- **Axios** - HTTP клиент
- **react-hot-toast** - уведомления
- **lucide-react** - иконки

## Структура проекта

```
src/
├── components/
│   └── ui/              # Базовые UI компоненты
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Spinner.tsx
│
├── pages/
│   ├── AdminPage/       # Страница дизайна залов
│   └── BookingPage/     # Страница бронирования
│
├── hooks/               # React Query hooks
│   ├── useHalls.ts
│   └── useReservations.ts
│
├── lib/
│   ├── api/             # API клиенты
│   │   ├── halls.ts
│   │   ├── tables.ts
│   │   └── reservations.ts
│   └── api-client.ts    # Axios instance
│
├── styles/
│   ├── theme.ts         # Design system (colors, spacing, typography)
│   └── GlobalStyles.tsx # Глобальные стили
│
├── App.tsx              # Main app с навигацией
├── main.tsx             # Entry point
└── index.css            # Базовые стили
```

## Компоненты

### UI Components

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" leftIcon={<Plus />}>
  Создать
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean
- `leftIcon` / `rightIcon`: ReactNode

#### Input
```tsx
import { Input } from '@/components/ui';

<Input
  label="Имя"
  placeholder="Введите имя"
  error="Обязательное поле"
  leftIcon={<User />}
/>
```

#### Card
```tsx
import { Card, CardHeader, CardContent } from '@/components/ui';

<Card padding="6">
  <CardHeader title="Заголовок" subtitle="Описание" />
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

#### Modal
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Заголовок"
  footer={<Button>OK</Button>}
>
  {/* content */}
</Modal>
```

#### Spinner
```tsx
import { Spinner, PageSpinner } from '@/components/ui';

<Spinner size="md" />
<PageSpinner /> // Full page loading
```

### React Query Hooks

#### useHalls
```tsx
import { useHalls, useCreateHall, useUpdateHall, useDeleteHall } from '@/hooks/useHalls';

function Component() {
  const { data: halls, isLoading } = useHalls();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();
  const deleteHall = useDeleteHall();

  const handleCreate = () => {
    createHall.mutate({
      name: 'Новый зал',
      width: 10,
      height: 8,
      sections: [],
      walls: [],
    });
  };
}
```

#### useReservations
```tsx
import { useReservations, useCreateReservation } from '@/hooks/useReservations';

function Component() {
  const { data: reservations } = useReservations({
    date: '2024-11-18',
    hallId: 'hall-1',
    status: 'confirmed',
  });

  const createReservation = useCreateReservation();
}
```

## Система дизайна

Все цвета, отступы, типографика находятся в `src/styles/theme.ts`.

### Цвета

```tsx
import { theme } from '@/styles/theme';

const Button = styled.button`
  background: ${theme.colors.primary[600]};
  color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
`;
```

**Палитра:**
- `primary` - основной цвет (синий)
- `secondary` - вторичный цвет (фиолетовый)
- `success` - зелёный
- `warning` - оранжевый
- `error` - красный
- `gray` - нейтральные цвета

### Spacing
```tsx
theme.spacing[1]  // 4px
theme.spacing[2]  // 8px
theme.spacing[4]  // 16px
theme.spacing[6]  // 24px
theme.spacing[8]  // 32px
```

### Typography
```tsx
theme.typography.fontSize.sm    // 14px
theme.typography.fontSize.base  // 16px
theme.typography.fontSize.lg    // 18px
theme.typography.fontSize['2xl'] // 24px
```

### Transitions
```tsx
theme.transitions.fast  // 150ms
theme.transitions.base  // 200ms
theme.transitions.slow  // 300ms
```

## API Integration

Все API запросы идут через React Query hooks. Автоматическое:
- Кэширование
- Повторные запросы
- Loading states
- Error handling
- Оптимистичные обновления

## Запуск

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Environment Variables

Create `.env`:
```env
VITE_API_URL=http://localhost:3001
```

## TODO

- [ ] Добавить drag-and-drop с @dnd-kit
- [ ] Формы с react-hook-form + zod
- [ ] Error boundaries
- [ ] Skeleton loaders
- [ ] Mobile responsive
- [ ] Dark mode
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] E2E тесты (Playwright)
