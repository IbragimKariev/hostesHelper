# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hostes** is a restaurant table booking system built as a modern monorepo with:
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL REST API
- **Frontend**: React 19 + Vite + TypeScript with drag-and-drop hall editor
- **Shared**: Common TypeScript types and Zod validation schemas

The system allows restaurant staff to:
- Visually design hall layouts with drag-and-drop table placement
- Manage table reservations and view booking status in real-time
- Manage daily menus (stop-list items, dishes of the day)
- View and manage staff rules
- User authentication with role-based access (admin, hostess)

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

### Linting
```bash
# Frontend only (from apps/frontend)
npm run lint            # ESLint with TypeScript rules
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
- `src/prisma/` - Database seed file
- `prisma/schema.prisma` - Database schema with Hall, Table, Reservation models

**Data Model**:
- **Hall**: Restaurant hall with dimensions (width/height in meters), pixelRatio (default 50), sections and walls (stored as JSON arrays)
- **Table**: Physical tables with positionX/positionY (pixels), sizeWidth/sizeHeight, shape (rectangle/circle/oval), seats (1-20), rotation (degrees), status (available/occupied/reserved/cleaning)
- **Reservation**: Bookings with date (DateTime), time (HH:MM string), duration (hours), status (confirmed/pending/cancelled/completed), linked to table and hall via foreign keys with CASCADE delete
- **User**: System users with login, password, name, and roleId
- **Role**: User roles (admin, hostess) with unique name constraint
- **StopListItem**: Daily unavailable dishes with name, reason, category, date, and isActive flag
- **DishOfDay**: Daily special dishes with name, description, price, category, date, and isActive flag
- **StaffRule**: Restaurant rules for staff with title, content, priority, category, and isActive flag

**API Patterns**:
- All endpoints return `{ success: boolean, data?: T, error?: string }`
- Backend stores table position as separate positionX/positionY fields, but API returns them as `position: { x, y }` objects
- Backend stores table size as separate sizeWidth/sizeHeight fields, but API returns them as `size: { width, height }` objects
- Request validation uses Zod schemas from `@hostes/shared` via `validateRequest` middleware
- Centralized error handling via `errorHandler` middleware
- Logging with Winston (dev: console, prod: files)
- CORS configured via CORS_ORIGIN environment variable

**Important Implementation Details**:
- Tables have unique constraint on `[hallId, number]` - table numbers must be unique within a hall
- Deleting a hall cascades to all its tables and reservations (onDelete: Cascade)
- Deleting a user is restricted if they have associated data (onDelete: Restrict for role foreign key)
- Reservation dates support DD-MM-YYYY and YYYY-MM-DD formats via Zod preprocessing
- JSON fields (Hall.sections, Hall.walls) are cast to `any` type when sending responses
- Authentication uses JWT tokens (implementation details in auth routes)
- Stop-list items and dishes of the day are filtered by date and isActive status
- Staff rules are ordered by priority (higher priority = more important)

### Frontend Architecture

**Tech Stack**: React 19 + Vite + React Query + styled-components + @dnd-kit

**Key Directories**:
- `src/pages/` - Page components (AdminPage, BookingPage, LoginPage, MenuManagementPage, StaffDashboardPage, UsersPage) with component subfolders
- `src/components/ui/` - Reusable UI components (Button, Card, Input, Modal, Select, Spinner)
- `src/lib/api/` - Axios API clients (halls.ts, tables.ts, reservations.ts, auth.ts, users.ts, roles.ts, stoplist.ts, dishes-of-day.ts, staff-rules.ts)
- `src/lib/api-client.ts` - Axios instance configuration with VITE_API_URL
- `src/hooks/` - React Query hooks (useHalls, useTables, useReservations, useAuth, useUsers, useRoles, useStopList, useDishesOfDay, useStaffRules)
- `src/styles/` - theme.ts and GlobalStyles.tsx

**State Management**:
- Server state: React Query with automatic caching, refetching, optimistic updates
- Query keys: `['halls']`, `['halls', id]`, `['tables', hallId]`, `['reservations']`, `['users']`, `['roles']`, `['stoplist']`, `['dishesOfDay']`, `['staffRules']`
- All mutations invalidate relevant queries and show toast notifications
- Local UI state: React useState/useReducer
- Zustand available for global state if needed (e.g., auth state)

**Key Features**:
- Drag-and-drop table placement using @dnd-kit/core (DndContext, useDraggable, useDroppable)
- Forms with react-hook-form + @hookform/resolvers/zod for validation
- Toast notifications with react-hot-toast (imported as `toast`)
- Error boundaries for graceful error handling
- Styled-components with theme system
- Icons from lucide-react
- Accessibility: ARIA labels, keyboard navigation, focus management

**Important Implementation Details**:
- HallCanvas component handles drag-and-drop and table positioning
- Tables are rendered with absolute positioning using transform: translate()
- AdminPage manages tool modes: 'select', 'add-table', 'add-section', 'add-wall'
- BookingPage shows read-only hall view with reservation form
- LoginPage handles authentication with JWT tokens
- MenuManagementPage manages stop-list items, dishes of the day, and staff rules
- UsersPage manages system users and their roles (admin/hostess)
- StaffDashboardPage displays current stop-list items, dishes of the day, and staff rules for hostess users

## API Endpoints

### Halls
- `GET /api/halls` - List all halls (includes tables array)
- `GET /api/halls/:id` - Get hall by ID (includes tables array)
- `POST /api/halls` - Create hall (requires: name, width, height; optional: pixelRatio, sections, walls)
- `PATCH /api/halls/:id` - Update hall (partial update)
- `DELETE /api/halls/:id` - Delete hall (cascades to tables and reservations)

### Tables
- `GET /api/tables?hallId=xxx` - List tables (filterable by hallId query param)
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create single table (requires: number, seats, shape, position, size, hallId)
- `POST /api/tables/bulk` - Create multiple tables in one request (body: array of CreateTableDto)
- `PATCH /api/tables/:id` - Update table (partial update, commonly used for position updates)
- `DELETE /api/tables/:id` - Delete table

### Reservations
- `GET /api/reservations?date=YYYY-MM-DD&hallId=xxx&status=xxx` - List with filters (all optional)
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create reservation (requires: tableId, hallId, customerName, customerPhone, guests, date, time, duration)
- `PATCH /api/reservations/:id` - Update reservation (partial update)
- `POST /api/reservations/:id/cancel` - Cancel reservation (sets status to 'cancelled')
- `DELETE /api/reservations/:id` - Delete reservation
- `GET /api/reservations/availability/:tableId?date=xxx&time=xxx&duration=xxx` - Check table availability

### Authentication & Users
- `POST /api/auth/login` - Login with credentials (returns JWT token)
- `POST /api/auth/register` - Register new user (requires: name, login, password, roleId)
- `GET /api/auth/me` - Get current user info (requires auth token)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (requires: name, login, password, roleId)
- `PATCH /api/users/:id` - Update user (partial update)
- `DELETE /api/users/:id` - Delete user
- `GET /api/roles` - List all roles

### Menu Management
- `GET /api/stoplist?date=YYYY-MM-DD&isActive=true` - List stop-list items (filterable by date and active status)
- `GET /api/stoplist/:id` - Get stop-list item by ID
- `POST /api/stoplist` - Create stop-list item (requires: name; optional: reason, category)
- `PATCH /api/stoplist/:id` - Update stop-list item (partial update)
- `DELETE /api/stoplist/:id` - Delete stop-list item
- `GET /api/dishes-of-day?date=YYYY-MM-DD&isActive=true` - List dishes of the day
- `GET /api/dishes-of-day/:id` - Get dish of the day by ID
- `POST /api/dishes-of-day` - Create dish of the day (requires: name; optional: description, price, category)
- `PATCH /api/dishes-of-day/:id` - Update dish of the day (partial update)
- `DELETE /api/dishes-of-day/:id` - Delete dish of the day
- `GET /api/staff-rules?isActive=true` - List staff rules (filterable by active status, ordered by priority)
- `GET /api/staff-rules/:id` - Get staff rule by ID
- `POST /api/staff-rules` - Create staff rule (requires: title, content; optional: priority, category)
- `PATCH /api/staff-rules/:id` - Update staff rule (partial update)
- `DELETE /api/staff-rules/:id` - Delete staff rule

## Important Patterns

### Adding New API Endpoints

1. Define Zod schema in `packages/shared/src/types.ts`:
```typescript
export const CreateFooDto = z.object({
  name: z.string().min(1),
});
export type CreateFooDto = z.infer<typeof CreateFooDto>;
```

2. Create route in `apps/backend/src/routes/foo.ts`:
```typescript
import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateFooDto } from '@hostes/shared';

const router = Router();

router.post('/', validateRequest(CreateFooDto), async (req, res, next) => {
  try {
    const data = await prisma.foo.create({ data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
```

3. Register route in `apps/backend/src/index.ts`:
```typescript
import fooRouter from './routes/foo';
app.use('/api/foo', fooRouter);
```

4. Create API client in `apps/frontend/src/lib/api/foo.ts`:
```typescript
import { apiClient } from '../api-client';
import type { CreateFooDto } from '@hostes/shared';

export const fooApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/foo');
    return response.data;
  },
  create: async (data: CreateFooDto) => {
    const response = await apiClient.post('/api/foo', data);
    return response.data;
  },
};
```

5. Create React Query hook in `apps/frontend/src/hooks/useFoo.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fooApi } from '@/lib/api';
import toast from 'react-hot-toast';

export const useFoos = () => {
  return useQuery({
    queryKey: ['foos'],
    queryFn: async () => {
      const { data } = await fooApi.getAll();
      return data;
    },
  });
};

export const useCreateFoo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fooApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foos'] });
      toast.success('Success message');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
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

**Important**:
- Always run `db:generate` after schema changes before starting the dev server
- Migration names should be descriptive (e.g., "add_user_table", "add_status_index")
- Use `npx prisma migrate reset` to reset database (WARNING: deletes all data)

### Drag-and-Drop Table Positioning

Tables use pixel coordinates (positionX, positionY) relative to hall dimensions:
- Hall dimensions (width, height) are in meters
- Displayed canvas size = hall dimension * pixelRatio (default 50px/meter)
- Table positions are stored in pixels in the database
- On drag end, `PATCH /api/tables/:id` is called with new `position: { x, y }`
- Use `@dnd-kit/core` for drag behavior, not HTML5 drag-and-drop
- Collision detection and boundary checking handled in HallCanvas component

### Form Validation

Always use react-hook-form with Zod resolver:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateReservationDto } from '@hostes/shared';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(CreateReservationDto),
});
```

This ensures client-side validation matches backend Zod schemas from `@hostes/shared`.

### API Response Handling

All API endpoints return a consistent format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

In frontend code, unwrap the response:
```typescript
const { data } = await hallsApi.getAll();  // axios response
return data.data;  // actual halls array
```

## Testing Strategy

To manually test the application:
1. Start dev servers: `npm run dev`
2. Open Prisma Studio: `cd apps/backend && npm run db:studio`
3. Check backend health: `curl http://localhost:3001/health`
4. Use React Query DevTools in browser (bottom-right icon in dev mode)
5. Check browser console for network errors
6. Check backend console for Winston logs

## Known Issues & Notes

- **Database timezone**: Reservation dates/times stored as ISO strings, handle timezone conversion in frontend
- **Cascading deletes**: Deleting a hall deletes all its tables and reservations (onDelete: Cascade in Prisma schema)
- **Table numbering**: Must be unique within a hall (`@@unique([hallId, number])` constraint)
- **Legacy code**: Root `src/` and `public/` directories contain old Create React App code - DO NOT MODIFY, only use as reference
- **JSON fields**: Hall.sections and Hall.walls are stored as JSON in PostgreSQL (for flexibility with complex shapes)
- **Position transformation**: Backend stores positionX/positionY separately, but API transforms to `position: { x, y }` object
- **Date formats**: Zod preprocessing supports both DD-MM-YYYY and YYYY-MM-DD formats for reservations
- **Authentication**: JWT tokens are stored in localStorage/cookies on frontend, sent via Authorization header
- **Role-based access**: Admin users have full access, hostess users have limited access to booking and staff dashboard
- **Menu management**: Stop-list and dishes of the day are date-specific, staff rules are persistent

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

**Note**: Frontend .env is optional if using default values.

## Troubleshooting

**"Cannot find module '@hostes/shared'"**
- Run `npm install` from root to link workspace packages
- Check that `packages/shared/dist` exists (run `npm run build` in shared package if needed)

**"P3000 - Table does not exist" or migration errors**
- Run `npm run db:migrate` from apps/backend
- If still failing, try `npx prisma migrate reset` (WARNING: deletes all data)

**CORS errors in browser**
- Check CORS_ORIGIN in backend .env matches frontend URL exactly
- Ensure backend is running on port 3001
- Check browser console for exact CORS error message

**Drag-and-drop not working**
- Check table positions aren't NaN or negative in database
- Verify DndContext wraps draggable components in component tree
- Check boundary collision detection logic in HallCanvas
- Inspect table transform styles in browser DevTools

**TypeScript errors after schema changes**
- Run `npm run db:generate` in apps/backend
- Restart TypeScript server in IDE
- Check that shared package types are exported correctly

## Additional Documentation

- [README.md](README.md) - Full project documentation with Russian content
- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [DONE.md](DONE.md) - Completed features and implementation status
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Guide for migrating from old CRA structure
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - Accessibility features and guidelines
