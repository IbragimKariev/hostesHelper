import { z } from 'zod';

// ===== ENUMS =====
export const TableShape = z.enum(['rectangle', 'circle', 'oval']);
export type TableShape = z.infer<typeof TableShape>;

export const TableStatus = z.enum(['available', 'occupied', 'reserved', 'cleaning']);
export type TableStatus = z.infer<typeof TableStatus>;

export const ReservationStatus = z.enum(['confirmed', 'pending', 'cancelled', 'completed']);
export type ReservationStatus = z.infer<typeof ReservationStatus>;

export const UserRole = z.enum(['admin', 'hostess']);
export type UserRole = z.infer<typeof UserRole>;

// ===== BASIC TYPES =====
export const Position = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof Position>;

export const Size = z.object({
  width: z.number(),
  height: z.number(),
});
export type Size = z.infer<typeof Size>;

// ===== SECTION =====
export const Section = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});
export type Section = z.infer<typeof Section>;

// ===== WALL =====
export const WallType = z.enum(['wall', 'window', 'entrance']);
export type WallType = z.infer<typeof WallType>;

export const Wall = z.object({
  id: z.string(),
  start: Position,
  end: Position,
  wallType: WallType.optional(), // Переименовано из 'type' т.к. 'type' - зарезервированное слово в PostgreSQL
});
export type Wall = z.infer<typeof Wall>;

// ===== TABLE =====
export const Table = z.object({
  id: z.string(),
  number: z.number(),
  seats: z.number().min(1).max(20),
  shape: TableShape,
  position: Position,
  size: Size,
  status: TableStatus,
  section: z.string().optional(),
  rotation: z.number().default(0),
  seatConfiguration: z.string().optional(),
  hallId: z.string(),
});
export type Table = z.infer<typeof Table>;

// ===== HALL (Restaurant Layout) =====
export const Hall = z.object({
  id: z.string(),
  name: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  pixelRatio: z.number().default(50),
  sections: z.array(Section).default([]),
  tables: z.array(Table).default([]),
  walls: z.array(Wall).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Hall = z.infer<typeof Hall>;

// ===== RESERVATION =====
export const Reservation = z.object({
  id: z.string(),
  tableId: z.string(),
  tableNumber: z.number(),
  hallId: z.string(),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/),
  guests: z.number().min(1).max(20),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().min(0.5).max(8),
  status: ReservationStatus,
  specialRequests: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
export type Reservation = z.infer<typeof Reservation>;

// ===== ROLE =====
export const Role = z.object({
  id: z.string(),
  name: UserRole,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Role = z.infer<typeof Role>;

// ===== USER =====
export const User = z.object({
  id: z.string(),
  name: z.string().min(2),
  login: z.string().min(3),
  roleId: z.string(),
  role: Role.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type User = z.infer<typeof User>;

// ===== DTO SCHEMAS =====

// Hall DTOs
export const CreateHallDto = Hall.omit({ id: true, createdAt: true, updatedAt: true, tables: true });
export type CreateHallDto = z.infer<typeof CreateHallDto>;

export const UpdateHallDto = CreateHallDto.partial();
export type UpdateHallDto = z.infer<typeof UpdateHallDto>;

// Table DTOs
export const CreateTableDto = Table.omit({ id: true });
export type CreateTableDto = z.infer<typeof CreateTableDto>;

export const UpdateTableDto = CreateTableDto.partial();
export type UpdateTableDto = z.infer<typeof UpdateTableDto>;

// Reservation DTOs
export const CreateReservationDto = z.object({
  tableId: z.string(),
  hallId: z.string(),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/),
  guests: z.number().min(1).max(20),
  date: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      // Поддержка форматов: DD-MM-YYYY, YYYY-MM-DD, ISO
      if (/^\d{2}-\d{2}-\d{4}$/.test(arg)) {
        // DD-MM-YYYY формат
        const [day, month, year] = arg.split('-');
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(arg);
    }
    if (arg instanceof Date) return arg;
    return arg;
  }, z.date()),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().min(0.5).max(8),
  status: ReservationStatus.optional(),
  specialRequests: z.string().optional(),
});
export type CreateReservationDto = z.infer<typeof CreateReservationDto>;

export const UpdateReservationDto = CreateReservationDto.partial();
export type UpdateReservationDto = z.infer<typeof UpdateReservationDto>;

// Query params
export const ReservationQueryDto = z.object({
  date: z.string().optional(),
  hallId: z.string().optional(),
  status: ReservationStatus.optional(),
  tableId: z.string().optional(),
});
export type ReservationQueryDto = z.infer<typeof ReservationQueryDto>;

// User DTOs
export const CreateUserDto = z.object({
  name: z.string().min(2),
  login: z.string().min(3),
  password: z.string().min(6),
  roleId: z.string(),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = CreateUserDto.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// Auth DTOs
export const LoginDto = z.object({
  login: z.string().min(3),
  password: z.string().min(6),
});
export type LoginDto = z.infer<typeof LoginDto>;

export const AuthResponse = z.object({
  user: User,
  token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
