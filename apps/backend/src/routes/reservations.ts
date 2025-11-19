import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest, validateQuery } from '../middleware/validateRequest';
import { CreateReservationDto, UpdateReservationDto, ReservationQueryDto } from '@hostes/shared';

const router = Router();

// GET /api/reservations - Get reservations with filters
router.get('/', validateQuery(ReservationQueryDto), async (req, res, next) => {
  try {
    const { date, hallId, status, tableId } = req.query;

    const where: any = {};

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (hallId) where.hallId = hallId;
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: true,
        hall: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations/:id - Get reservation by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        hall: true,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found',
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reservations - Create new reservation
router.post('/', validateRequest(CreateReservationDto), async (req, res, next) => {
  try {
    const data = req.body;
    console.log('Received date:', data.date, 'Type:', typeof data.date);

    // Get table to fetch table number
    const table = await prisma.table.findUnique({
      where: { id: data.tableId },
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    // Check for conflicts
    const targetDate = new Date(data.date);

    // Проверяем валидность даты
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicts = await prisma.reservation.findMany({
      where: {
        tableId: data.tableId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    // Check time conflicts
    const [targetHour, targetMinute] = data.time.split(':').map(Number);
    const targetStartMinutes = targetHour * 60 + targetMinute;
    const targetEndMinutes = targetStartMinutes + data.duration * 60;

    for (const conflict of conflicts) {
      const [conflictHour, conflictMinute] = conflict.time.split(':').map(Number);
      const conflictStartMinutes = conflictHour * 60 + conflictMinute;
      const conflictEndMinutes = conflictStartMinutes + conflict.duration * 60;

      if (
        (targetStartMinutes >= conflictStartMinutes && targetStartMinutes < conflictEndMinutes) ||
        (targetEndMinutes > conflictStartMinutes && targetEndMinutes <= conflictEndMinutes) ||
        (targetStartMinutes <= conflictStartMinutes && targetEndMinutes >= conflictEndMinutes)
      ) {
        return res.status(409).json({
          success: false,
          error: 'Time slot is already reserved',
          conflict: conflict,
        });
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        tableId: data.tableId,
        tableNumber: table.number,
        hallId: data.hallId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guests: data.guests,
        date: new Date(data.date),
        time: data.time,
        duration: data.duration,
        status: data.status || 'pending',
        specialRequests: data.specialRequests,
      },
      include: {
        table: true,
        hall: true,
      },
    });

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reservations/:id - Update reservation
router.patch('/:id', validateRequest(UpdateReservationDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updateData: any = {};

    if (data.tableId !== undefined) {
      const table = await prisma.table.findUnique({
        where: { id: data.tableId },
      });
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found',
        });
      }
      updateData.tableId = data.tableId;
      updateData.tableNumber = table.number;
    }

    if (data.hallId !== undefined) updateData.hallId = data.hallId;
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
    if (data.guests !== undefined) updateData.guests = data.guests;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.time !== undefined) updateData.time = data.time;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        hall: true,
      },
    });

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reservations/:id - Delete reservation
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.reservation.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Reservation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reservations/:id/cancel - Cancel reservation
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
      include: {
        table: true,
        hall: true,
      },
    });

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reservations/availability/:tableId - Check table availability
router.get('/availability/:tableId', async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required',
      });
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const reservations = await prisma.reservation.findMany({
      where: {
        tableId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'cancelled',
        },
      },
      orderBy: {
        time: 'asc',
      },
    });

    res.json({
      success: true,
      data: {
        tableId,
        date: date as string,
        reservations,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
