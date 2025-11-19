# Hostes - Система бронирования столиков

Современное приложение для управления залами ресторана и бронирования столиков.

## Архитектура проекта

```
hostes/
├── apps/
│   ├── backend/        # Node.js + Express + Prisma API
│   └── frontend/       # React + Vite + TypeScript
├── packages/
│   └── shared/         # Общие типы и схемы валидации (Zod)
└── package.json        # Monorepo root
```

## Технологический стек

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - REST API
- **Prisma** - ORM для PostgreSQL
- **Zod** - валидация данных
- **Winston** - логирование

### Frontend
- **React 19** + **TypeScript**
- **Vite** - сборщик
- **React Router v6** - роутинг
- **React Query** - управление серверным состоянием
- **Zustand** - глобальный стейт (если нужно)
- **styled-components** - стилизация
- **react-hook-form** + **Zod** - формы
- **@dnd-kit** - drag and drop
- **react-hot-toast** - уведомления

### Shared
- **Zod** - общие схемы валидации
- **TypeScript** - типы для frontend и backend

## 🚀 Быстрый старт

**→ См. [QUICKSTART.md](QUICKSTART.md) для пошаговой установки (5 минут)**

### Кратко:

```bash
# 1. Установка
npm install

# 2. Настройка backend
cd apps/backend
cp .env.example .env
# Отредактируйте DATABASE_URL

# 3. База данных
createdb hostes
npm run db:migrate
npm run db:seed

# 4. Запуск
cd ../..
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

---

## Подробная установка

### 1. Установка зависимостей

```bash
# Установка всех зависимостей для всего монорепозитория
npm install
```

### 2. Настройка Backend

```bash
# Создание .env файла
cd apps/backend
cp .env.example .env

# Отредактируйте .env и укажите подключение к PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/hostes"
```

### 3. Настройка базы данных

```bash
# Создайте базу данных PostgreSQL
createdb hostes

# Примените миграции
npm run db:migrate

# Заполните базу тестовыми данными
npm run db:seed
```

### 4. Запуск приложения

#### Вариант 1: Запуск всего проекта (из корня)

```bash
npm run dev
```

Это запустит:
- Backend на http://localhost:3001
- Frontend на http://localhost:5173

#### Вариант 2: Запуск раздельно

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 5. Открыть приложение

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Prisma Studio:** `npm run db:studio` (из apps/backend)

## Структура API

### Halls (Залы)
- `GET /api/halls` - Получить все залы
- `POST /api/halls` - Создать зал
- `PATCH /api/halls/:id` - Обновить зал
- `DELETE /api/halls/:id` - Удалить зал

### Tables (Столики)
- `GET /api/tables?hallId=xxx` - Получить столики
- `POST /api/tables` - Создать столик
- `POST /api/tables/bulk` - Создать несколько столиков
- `PATCH /api/tables/:id` - Обновить столик
- `DELETE /api/tables/:id` - Удалить столик

### Reservations (Бронирования)
- `GET /api/reservations?date=2024-01-01&hallId=xxx` - Получить бронирования
- `POST /api/reservations` - Создать бронирование
- `PATCH /api/reservations/:id` - Обновить бронирование
- `POST /api/reservations/:id/cancel` - Отменить бронирование
- `DELETE /api/reservations/:id` - Удалить бронирование

## Скрипты

### Root (Monorepo)
```bash
npm run dev              # Запустить frontend + backend
npm run dev:frontend     # Только frontend
npm run dev:backend      # Только backend
npm run build            # Сборка frontend + backend
```

### Backend
```bash
npm run dev              # Development mode (hot reload)
npm run build            # Production build
npm start                # Запуск production
npm run db:migrate       # Применить миграции
npm run db:seed          # Заполнить БД данными
npm run db:studio        # Открыть Prisma Studio
```

### Frontend
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

## Что дальше?

### Фаза 1: Завершение базовой функциональности ✅
- ✅ Backend API (Express + Prisma)
- ✅ Database schema (PostgreSQL)
- ✅ Frontend структура (Vite + React)
- ✅ API integration (React Query)
- ✅ Роутинг (React Router)

### Фаза 2: Переписать страницы (TODO)
- ⏳ Admin Page - редактор залов с drag-and-drop
- ⏳ Booking Page - интерфейс бронирования
- ⏳ Интеграция с API hooks
- ⏳ Формы с react-hook-form + zod

### Фаза 3: UI/UX улучшения (TODO)
- ⏳ Loading states
- ⏳ Error boundaries
- ⏳ Toast notifications (уже подключён react-hot-toast)
- ⏳ Адаптивность
- ⏳ Accessibility

### Фаза 4: Дополнительные фичи (TODO)
- ⏳ Аутентификация (JWT)
- ⏳ Роли (admin, hostess)
- ⏳ История изменений
- ⏳ Экспорт/импорт залов
- ⏳ Статистика бронирований

## Миграция со старого проекта

Старый проект находится в папках:
- `src/` - старый React код (CRA)
- `public/` - старые статические файлы

Эти файлы можно использовать как референс при переписывании компонентов.

## Требования

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Troubleshooting

### Backend не запускается
- Проверьте, что PostgreSQL запущен
- Проверьте DATABASE_URL в .env
- Запустите миграции: `npm run db:migrate`

### Frontend не подключается к API
- Убедитесь, что backend запущен на порту 3001
- Проверьте CORS настройки в backend/.env
- Проверьте proxy в frontend/vite.config.ts

## Лицензия

MIT
