# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hostes** is a restaurant table booking system built as a modern monorepo with:
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL REST API
- **Frontend**: React 19 + Vite + TypeScript with drag-and-drop hall editor
- **Shared**: Common TypeScript types and Zod validation schemas

The system allows restaurant staff to:
- Visually design hall layouts with drag-and-drop table placement
- Manage table reservations
- View booking status in real-time

## Development Commands

### Initial Setup
```bash
# Install all dependencies for monorepo
npm install

# Setup backend environment
cd apps/backend
cp .env.example .env
# Edit .env with PostgreSQL connection string

# Create database and apply migrations
createdb hostes
npm run db:migrate
npm run db:seed
```

### Running the Application
```bash
# Run both frontend and backend (from root)
npm run dev

# Run separately
npm run dev:frontend    # Frontend only on :5173
npm run dev:backend     # Backend only on :3001
```

### Database Operations
```bash
# All commands run from apps/backend or root with --workspace flag
npm run db:migrate      # Apply Prisma migrations
npm run db:seed         # Populate with test data
npm run db:studio       # Open Prisma Studio UI on :5555
npm run db:generate     # Regenerate Prisma Client after schema changes
```

### Building
```bash
# From root
npm run build           # Build both apps
npm run build:frontend
npm run build:backend
```

## Architecture

### Monorepo Structure
- `apps/backend/` - Express API server with Prisma ORM
- `apps/frontend/` - React SPA built with Vite
- `packages/shared/` - Shared TypeScript types and Zod validation schemas used by both apps

### Backend Architecture

**Tech Stack**: Express.js + Prisma + PostgreSQL + Zod + Winston

**Key Directories**:
- `src/routes/` - API route handlers (halls.ts, tables.ts, reservations.ts)
- `src/middleware/` - Request validation and error handling
- `src/utils/` - Prisma client singleton, Winston logger
- `prisma/schema.prisma` - Database schema with Hall, Table, Reservation models

**Data Model**:
- **Hall**: Restaurant hall with dimensions, sections, walls (stored as JSON)
- **Table**: Physical tables with position (x,y), shape, seats, rotation
- **Reservation**: Bookings linked to table and hall with customer info, time slots

**API Patterns**:
- All endpoints return `{ success: boolean, data?: T, error?: string }`
- Request validation uses Zod schemas from `@hostes/shared`
- Centralized error handling via `errorHandler` middleware
- Logging with Winston (dev: console, prod: files)

### Frontend Architecture

**Tech Stack**: React 19 + Vite + React Query + styled-components + @dnd-kit

**Key Directories**:
- `src/pages/` - Page components (AdminPage, BookingPage)
- `src/components/` - Reusable UI components and design system
- `src/lib/api/` - Axios API clients (halls.ts, tables.ts, reservations.ts)
- `src/hooks/` - React Query hooks (useHalls, useTables, useReservations)
- `src/styles/` - Theme, GlobalStyles

**State Management**:
- Server state: React Query with automatic caching, refetching
- Local UI state: React useState/useReducer
- No global state library needed currently (Zustand available if needed)

**Key Features**:
- Drag-and-drop table placement using @dnd-kit
- Forms with react-hook-form + Zod validation
- Toast notifications with react-hot-toast
- Error boundaries for graceful error handling
- Accessibility: ARIA labels, keyboard navigation, focus management

## API Endpoints

### Halls
- `GET /api/halls` - List all halls
- `GET /api/halls/:id` - Get hall by ID
- `POST /api/halls` - Create hall (requires: name, width, height)
- `PATCH /api/halls/:id` - Update hall
- `DELETE /api/halls/:id` - Delete hall (cascades to tables)

### Tables
- `GET /api/tables?hallId=xxx` - List tables (filterable by hallId)
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create single table
- `POST /api/tables/bulk` - Create multiple tables in one request
- `PATCH /api/tables/:id` - Update table (position, status, etc.)
- `DELETE /api/tables/:id` - Delete table

### Reservations
- `GET /api/reservations?date=YYYY-MM-DD&hallId=xxx&status=xxx` - List with filters
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id` - Update reservation
- `POST /api/reservations/:id/cancel` - Cancel reservation (sets status to 'cancelled')
- `DELETE /api/reservations/:id` - Delete reservation
- `GET /api/reservations/availability/:tableId?date=xxx&time=xxx&duration=xxx` - Check availability

## Important Patterns

### Adding New API Endpoints

1. Define Zod schema in `packages/shared/src/types.ts`:
```typescript
export const CreateFooDto = z.object({
  name: z.string().min(1),
});
```

2. Create route in `apps/backend/src/routes/foo.ts`:
```typescript
import { validateRequest } from '../middleware/validateRequest';
import { CreateFooDto } from '@hostes/shared';

router.post('/', validateRequest(CreateFooDto), async (req, res) => {
  const data = await prisma.foo.create({ data: req.body });
  res.json({ success: true, data });
});
```

3. Create API client in `apps/frontend/src/lib/api/foo.ts`:
```typescript
import { apiClient } from '../api-client';

export const fooApi = {
  getAll: () => apiClient.get('/api/foo'),
  create: (data) => apiClient.post('/api/foo', data),
};
```

4. Create React Query hook in `apps/frontend/src/hooks/useFoo.ts`:
```typescript
export const useFoos = () => {
  return useQuery({
    queryKey: ['foos'],
    queryFn: async () => {
      const { data } = await fooApi.getAll();
      return data.data;
    },
  });
};
```

### Working with Prisma

After modifying `prisma/schema.prisma`:
```bash
cd apps/backend
npm run db:generate    # Regenerate Prisma Client
npx prisma migrate dev --name description_of_changes
```

### Drag-and-Drop Table Positioning

Tables use pixel coordinates (positionX, positionY) relative to hall dimensions:
- Hall dimensions are in meters, converted to pixels via `pixelRatio` (default 50px/meter)
- Table positions are persisted to backend on drag end
- Use `@dnd-kit` for drag behavior, not HTML5 drag-and-drop

### Form Validation

Always use react-hook-form with Zod resolver:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(CreateReservationDto),
});
```

This ensures client-side validation matches backend Zod schemas.

## Testing Strategy

To manually test the application:
1. Start dev servers: `npm run dev`
2. Open Prisma Studio: `cd apps/backend && npm run db:studio`
3. Check backend health: `curl http://localhost:3001/health`
4. Use React Query DevTools in browser (bottom-right icon in dev mode)

## Known Issues & Notes

- **Database timezone**: Reservation dates/times stored as ISO strings, handle timezone conversion in frontend
- **Cascading deletes**: Deleting a hall deletes all its tables and reservations
- **Table numbering**: Must be unique within a hall (`@@unique([hallId, number])`)
- **Legacy code**: `src/` and `public/` directories contain old Create React App code - DO NOT MODIFY, only use as reference
- **JSON fields**: Hall.sections and Hall.walls are stored as JSON in PostgreSQL (for flexibility with complex shapes)

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hostes?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Troubleshooting

**"Cannot find module '@hostes/shared'"**
- Run `npm install` from root to link workspace packages

**"P3000 - Table does not exist"**
- Run `npm run db:migrate` from apps/backend

**CORS errors in browser**
- Check CORS_ORIGIN in backend .env matches frontend URL
- Ensure backend is running

**Drag-and-drop not working**
- Check table positions aren't NaN or negative
- Verify DndContext wraps draggable components
- Check boundary collision detection logic

## Additional Documentation

- [README.md](README.md) - Full project documentation
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [DONE.md](DONE.md) - Completed features and implementation status
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Guide for migrating from old CRA structure
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - Accessibility features and guidelines
