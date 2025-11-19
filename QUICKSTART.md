# 🚀 Быстрый старт

## Установка и запуск проекта (5 минут)

### Шаг 1: Установка зависимостей
```bash
npm install
```

### Шаг 2: Настройка Backend

#### 2.1 Создать .env файл
```bash
cd apps/backend
cp .env.example .env
```

#### 2.2 Отредактировать DATABASE_URL в .env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hostes?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### 2.3 Создать базу данных PostgreSQL
```bash
# Если используете psql
createdb hostes

# Или через psql
psql -U postgres -c "CREATE DATABASE hostes;"
```

#### 2.4 Применить миграции
```bash
npm run db:migrate
```

#### 2.5 Заполнить базу тестовыми данными
```bash
npm run db:seed
```

### Шаг 3: Настройка Frontend (опционально)

```bash
cd apps/frontend
cp .env.example .env
```

В `.env` уже есть правильный URL:
```env
VITE_API_URL=http://localhost:3001
```

### Шаг 4: Запуск проекта

```bash
# Из корня проекта
npm run dev
```

Это запустит:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173

### Шаг 5: Открыть в браузере

Frontend: http://localhost:5173

---

## Проверка что всё работает

### 1. Проверить Backend API
```bash
curl http://localhost:3001/health
```

Должно вернуть:
```json
{"status":"ok","timestamp":"2024-11-18T..."}
```

### 2. Проверить Halls API
```bash
curl http://localhost:3001/api/halls
```

Должно вернуть список залов:
```json
{"success":true,"data":[...]}
```

### 3. Открыть Prisma Studio (опционально)
```bash
cd apps/backend
npm run db:studio
```

Откроется http://localhost:5555 с UI для просмотра БД

---

## Если что-то пошло не так

### Backend не запускается

**Ошибка:** `Error: connect ECONNREFUSED`
- Проверьте что PostgreSQL запущен
- Проверьте DATABASE_URL в `.env`

**Ошибка:** `Error: P3000 - Table does not exist`
```bash
cd apps/backend
npm run db:migrate
```

### Frontend не подключается к API

**Ошибка:** `Network Error` или `CORS`
- Убедитесь что backend запущен на :3001
- Проверьте CORS_ORIGIN в backend/.env
- Проверьте VITE_API_URL в frontend/.env

### Миграции не применяются

```bash
# Сбросить базу и пересоздать
cd apps/backend
npx prisma migrate reset
npm run db:seed
```

---

## Полезные команды

### Development
```bash
npm run dev              # Запустить всё
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
```

### Database
```bash
npm run db:migrate       # Применить миграции
npm run db:seed          # Заполнить данными
npm run db:studio        # Открыть Prisma Studio
npm run db:generate      # Регенерировать Prisma Client
```

### Build
```bash
npm run build            # Собрать всё
npm run build:backend    # Только backend
npm run build:frontend   # Только frontend
```

---

## Что дальше?

1. Прочитайте [README.md](README.md) - главная документация
2. Изучите [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - как переписать компоненты
3. Посмотрите [DONE.md](DONE.md) - что уже готово

---

## Структура проекта (после установки)

```
hostes/
├── apps/
│   ├── backend/
│   │   ├── node_modules/     ✅
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/    ✅ После db:migrate
│   │   ├── src/
│   │   ├── .env              ✅ Создать вручную
│   │   └── package.json
│   │
│   └── frontend/
│       ├── node_modules/     ✅
│       ├── src/
│       ├── .env              ✅ Опционально
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── node_modules/     ✅
│       └── dist/             ✅ После npm install
│
├── node_modules/             ✅ После npm install
└── package.json
```

---

**Время установки:** ~2-3 минуты (зависит от интернета)
**Готово к разработке!** 🎉
