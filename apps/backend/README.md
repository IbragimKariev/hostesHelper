# Hostes Backend API

Backend для системы бронирования столиков в ресторане.

## Технологии

- **Node.js** + **TypeScript**
- **Express** - REST API сервер
- **Prisma** - ORM для работы с PostgreSQL
- **Zod** - валидация данных
- **Winston** - логирование

## Установка

```bash
# Установка зависимостей (из корня проекта)
npm install

# Создание .env файла
cp .env.example .env
```

## Настройка базы данных

1. Установите PostgreSQL
2. Создайте базу данных:
```bash
createdb hostes
```

3. Настройте подключение в `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hostes?schema=public"
```

4. Примените миграции:
```bash
npm run db:migrate
```

5. Заполните базу тестовыми данными:
```bash
npm run db:seed
```

## Запуск

```bash
# Development mode (с hot reload)
npm run dev

# Production build
npm run build
npm start

# Открыть Prisma Studio (UI для БД)
npm run db:studio
```

## API Endpoints

### Halls (Залы)

- `GET /api/halls` - Получить все залы
- `GET /api/halls/:id` - Получить зал по ID
- `POST /api/halls` - Создать новый зал
- `PATCH /api/halls/:id` - Обновить зал
- `DELETE /api/halls/:id` - Удалить зал

### Tables (Столики)

- `GET /api/tables` - Получить все столики (query: `?hallId=xxx`)
- `GET /api/tables/:id` - Получить столик по ID
- `POST /api/tables` - Создать новый столик
- `POST /api/tables/bulk` - Создать несколько столиков
- `PATCH /api/tables/:id` - Обновить столик
- `DELETE /api/tables/:id` - Удалить столик

### Reservations (Бронирования)

- `GET /api/reservations` - Получить бронирования (query: `?date=2024-01-01&hallId=xxx&status=confirmed`)
- `GET /api/reservations/:id` - Получить бронирование по ID
- `GET /api/reservations/availability/:tableId` - Проверить доступность столика (query: `?date=2024-01-01`)
- `POST /api/reservations` - Создать новое бронирование
- `POST /api/reservations/:id/cancel` - Отменить бронирование
- `PATCH /api/reservations/:id` - Обновить бронирование
- `DELETE /api/reservations/:id` - Удалить бронирование

## Структура проекта

```
apps/backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── prisma/             # Database seed
│   ├── utils/              # Utilities (logger, prisma client)
│   └── index.ts            # Main server file
├── .env.example
├── package.json
└── tsconfig.json
```

## Примеры запросов

### Создание зала
```bash
curl -X POST http://localhost:3001/api/halls \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый зал",
    "width": 10,
    "height": 8,
    "sections": [],
    "walls": []
  }'
```

### Создание бронирования
```bash
curl -X POST http://localhost:3001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "xxx",
    "hallId": "yyy",
    "customerName": "Иван Иванов",
    "customerPhone": "+7 900 123 45 67",
    "guests": 4,
    "date": "2024-11-20",
    "time": "19:00",
    "duration": 2,
    "status": "pending"
  }'
```
