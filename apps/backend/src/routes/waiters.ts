import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateWaiterDto, UpdateWaiterDto } from '@hostes/shared';

const router = Router();

// GET /api/waiters - Get all waiters
router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;

    const where = active !== undefined
      ? { isActive: active === 'true' }
      : {};

    const waiters = await prisma.waiter.findMany({
      where,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: waiters,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/waiters/:id - Get waiter by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const waiter = await prisma.waiter.findUnique({
      where: { id },
      include: {
        reservations: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        error: 'Waiter not found',
      });
    }

    res.json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/waiters - Create new waiter
router.post('/', validateRequest(CreateWaiterDto), async (req, res, next) => {
  try {
    const data = req.body;

    const waiter = await prisma.waiter.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthYear: data.birthYear,
        languages: data.languages || [],
        isActive: data.isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/waiters/:id - Update waiter
router.patch('/:id', validateRequest(UpdateWaiterDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const waiter = await prisma.waiter.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.birthYear !== undefined && { birthYear: data.birthYear }),
        ...(data.languages !== undefined && { languages: data.languages }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    res.json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/waiters/:id - Delete waiter
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if waiter has any reservations
    const reservationsCount = await prisma.reservation.count({
      where: { waiterId: id },
    });

    if (reservationsCount > 0) {
      // Soft delete - just deactivate
      await prisma.waiter.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Waiter deactivated (has existing reservations)',
      });
    }

    // Hard delete if no reservations
    await prisma.waiter.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Waiter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
