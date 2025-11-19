# Руководство по миграции с CRA на новую архитектуру

## Что было сделано

### 1. Создана структура монорепозитория

Проект теперь разделён на:
- `apps/backend` - Node.js API сервер
- `apps/frontend` - React приложение на Vite
- `packages/shared` - общие типы и схемы валидации

### 2. Backend (Node.js + Express + Prisma)

Создан полноценный REST API для работы с:
- **Halls (Залы)** - CRUD операции для залов ресторана
- **Tables (Столики)** - управление столиками
- **Reservations (Бронирования)** - система бронирования

**Файлы backend:**
```
apps/backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── routes/
│   │   ├── halls.ts           # API для залов
│   │   ├── tables.ts          # API для столиков
│   │   └── reservations.ts    # API для бронирований
│   ├── middleware/
│   │   ├── errorHandler.ts    # Обработка ошибок
│   │   └── validateRequest.ts # Валидация запросов
│   ├── utils/
│   │   ├── logger.ts          # Winston logger
│   │   └── prisma.ts          # Prisma client
│   ├── prisma/
│   │   └── seed.ts            # Начальные данные
│   └── index.ts               # Main server file
├── .env.example
├── package.json
└── tsconfig.json
```

### 3. Frontend (React + Vite)

Создана новая структура фронтенда с:
- **Vite** вместо Create React App (намного быстрее)
- **React Router v6** для роутинга
- **React Query** для работы с API
- **styled-components** для стилизации
- **react-hot-toast** для уведомлений

**Файлы frontend:**
```
apps/frontend/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── halls.ts         # API клиент для залов
│   │   │   ├── tables.ts        # API клиент для столиков
│   │   │   └── reservations.ts  # API клиент для бронирований
│   │   └── api-client.ts        # Axios instance с interceptors
│   ├── hooks/
│   │   ├── useHalls.ts          # React Query hooks для залов
│   │   └── useReservations.ts   # React Query hooks для бронирований
│   ├── App.tsx                  # Main app с роутингом
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 4. Shared Package

Создан пакет с общими типами и валидацией:
```
packages/shared/
├── src/
│   ├── types.ts    # Все типы + Zod схемы
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Типы включают:**
- `Hall` - зал ресторана
- `Table` - столик
- `Reservation` - бронирование
- `CreateXxxDto` - DTO для создания
- `UpdateXxxDto` - DTO для обновления
- `ApiResponse<T>` - типизированный ответ API

## Что нужно сделать дальше

### Фаза 1: Переписать компоненты (HIGH PRIORITY)

#### 1.1 Admin Page (Редактор залов)

**Текущие компоненты из старого проекта:**
- `src/pages/AdminLayoutPage/` - можно использовать как референс

**Что нужно переписать:**
1. Создать `apps/frontend/src/pages/AdminPage/index.tsx`
2. Интегрировать с API через `useHalls()` hook
3. Заменить старую систему drag-and-drop на `@dnd-kit`
4. Переписать компоненты:
   - `HallGrid` - сетка зала с drag-and-drop
   - `HallsPanel` - панель с списком залов
   - `Toolbar` - панель инструментов
   - `TableItem` - столик на сетке

**Пример использования API:**
```tsx
import { useHalls, useCreateHall, useUpdateHall } from '@/hooks/useHalls';

function AdminPage() {
  const { data: halls, isLoading } = useHalls();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();

  const handleCreateHall = () => {
    createHall.mutate({
      name: 'Новый зал',
      width: 10,
      height: 8,
      sections: [],
      walls: [],
    });
  };

  // ... rest of component
}
```

#### 1.2 Booking Page (Интерфейс бронирования)

**Текущие компоненты из старого проекта:**
- `src/pages/HostessBookingPage/` - можно использовать как референс

**Что нужно переписать:**
1. Создать `apps/frontend/src/pages/BookingPage/index.tsx`
2. Интегрировать с API через `useReservations()` hook
3. Переписать компоненты:
   - `BookingForm` - форма бронирования (использовать react-hook-form)
   - `CalendarView` - выбор даты и времени
   - `ReservationList` - список бронирований
   - `TableLayout` - визуализация столов

**Пример использования API:**
```tsx
import { useReservations, useCreateReservation } from '@/hooks/useReservations';
import { useForm } from 'react-hook-form';

function BookingPage() {
  const { data: reservations } = useReservations({
    date: new Date().toISOString(),
    hallId: selectedHallId
  });

  const createReservation = useCreateReservation();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    createReservation.mutate(data);
  };

  // ... rest of component
}
```

### Фаза 2: Формы с валидацией

Все формы должны использовать `react-hook-form` + `zod`:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateReservationDto } from '@hostes/shared';

function BookingForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateReservationDto),
  });

  // ... rest of component
}
```

### Фаза 3: Drag-and-Drop с @dnd-kit

Заменить текущую систему drag-and-drop на `@dnd-kit`:

```tsx
import { DndContext, useDraggable } from '@dnd-kit/core';

function TableItem({ table }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {/* table content */}
    </div>
  );
}
```

### Фаза 4: UI/UX улучшения

1. **Loading states:**
```tsx
function AdminPage() {
  const { data: halls, isLoading } = useHalls();

  if (isLoading) return <Spinner />;

  return <div>...</div>;
}
```

2. **Error boundaries:**
Создать `ErrorBoundary` component

3. **Toast notifications:**
Уже настроены через `react-hot-toast`, используйте:
```tsx
import toast from 'react-hot-toast';

toast.success('Зал создан!');
toast.error('Ошибка при создании');
```

## Как копировать компоненты из старого проекта

1. Откройте старый компонент из `src/pages/`
2. Скопируйте логику и JSX
3. Замените:
   - `useState` с mock данными → `useQuery` / `useMutation`
   - Прямое изменение стейта → вызов mutation hooks
   - Локальный стейт → API calls
   - console.log → toast notifications

**Пример миграции:**

**Старый код:**
```tsx
const [halls, setHalls] = useState(mockHalls);

const handleCreateHall = (newHall) => {
  setHalls([...halls, newHall]);
  console.log('Created hall:', newHall);
};
```

**Новый код:**
```tsx
const { data: halls } = useHalls();
const createHall = useCreateHall();

const handleCreateHall = (newHall) => {
  createHall.mutate(newHall);
  // Toast уже показывается в useCreateHall hook
};
```

## Запуск проекта

1. Установите зависимости:
```bash
npm install
```

2. Настройте PostgreSQL и создайте `.env`:
```bash
cd apps/backend
cp .env.example .env
# Отредактируйте DATABASE_URL
```

3. Примените миграции:
```bash
npm run db:migrate
npm run db:seed
```

4. Запустите проект:
```bash
npm run dev
```

Backend будет на http://localhost:3001
Frontend будет на http://localhost:5173

## Полезные ссылки

- [React Query Docs](https://tanstack.com/query/latest)
- [react-hook-form Docs](https://react-hook-form.com/)
- [dnd-kit Docs](https://docs.dndkit.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Docs](https://zod.dev/)

## Контрольный список миграции

- [x] Создана структура монорепозитория
- [x] Настроен backend с API
- [x] Создана database schema
- [x] Настроен frontend с Vite
- [x] Добавлен роутинг
- [x] Настроен React Query
- [x] Созданы API hooks
- [ ] Переписана Admin Page
- [ ] Переписана Booking Page
- [ ] Добавлены формы с валидацией
- [ ] Интегрирован @dnd-kit
- [ ] Добавлены loading states
- [ ] Добавлены error boundaries
- [ ] Тестирование
- [ ] Удаление старого кода из src/

## Заметки

- Старый код находится в `src/` и `public/` - НЕ УДАЛЯЙТЕ до завершения миграции
- Используйте старый код как референс для UI и логики
- Все новые компоненты создавайте в `apps/frontend/src/`
- Backend готов к использованию и не требует изменений для базовой функциональности
