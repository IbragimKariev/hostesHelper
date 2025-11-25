import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateDishOfDayDto, UpdateDishOfDayDto } from '@hostes/shared';

const router = Router();

// GET /api/dishes-of-day - Получить все блюда дня
router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query;

    const items = await prisma.dishOfDay.findMany({
      where: all === 'true' ? {} : { isActive: true },
      orderBy: [
        { date: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dishes-of-day/today - Получить блюда дня на сегодня
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await prisma.dishOfDay.findMany({
      where: {
        isActive: true,
        date: {
          gte: today,
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dishes-of-day/:id - Получить блюдо по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.dishOfDay.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Dish of day not found',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/dishes-of-day - Создать блюдо дня
router.post('/', validateRequest(CreateDishOfDayDto), async (req, res, next) => {
  try {
    const data = req.body;

    const item = await prisma.dishOfDay.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isActive: data.isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/dishes-of-day/:id - Обновить блюдо
router.patch('/:id', validateRequest(UpdateDishOfDayDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const item = await prisma.dishOfDay.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/dishes-of-day/:id - Удалить блюдо
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.dishOfDay.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Dish of day deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
