import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateStopListItemDto, UpdateStopListItemDto } from '@hostes/shared';

const router = Router();

// GET /api/stoplist - Получить все элементы стоп-листа (активные)
router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query; // ?all=true для получения всех, включая неактивные

    const items = await prisma.stopListItem.findMany({
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

// GET /api/stoplist/today - Получить стоп-лист на сегодня
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await prisma.stopListItem.findMany({
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

// GET /api/stoplist/:id - Получить элемент по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.stopListItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Stop list item not found',
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

// POST /api/stoplist - Создать элемент стоп-листа
router.post('/', validateRequest(CreateStopListItemDto), async (req, res, next) => {
  try {
    const data = req.body;

    const item = await prisma.stopListItem.create({
      data: {
        name: data.name,
        reason: data.reason,
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

// PATCH /api/stoplist/:id - Обновить элемент
router.patch('/:id', validateRequest(UpdateStopListItemDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const item = await prisma.stopListItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.reason !== undefined && { reason: data.reason }),
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

// DELETE /api/stoplist/:id - Удалить элемент
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.stopListItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Stop list item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
