import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateStaffRuleDto, UpdateStaffRuleDto } from '@hostes/shared';

const router = Router();

// GET /api/staff-rules - Получить все правила
router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query;

    const rules = await prisma.staffRule.findMany({
      where: all === 'true' ? {} : { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/staff-rules/:id - Получить правило по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const rule = await prisma.staffRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Staff rule not found',
      });
    }

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/staff-rules - Создать правило
router.post('/', validateRequest(CreateStaffRuleDto), async (req, res, next) => {
  try {
    const data = req.body;

    const rule = await prisma.staffRule.create({
      data: {
        title: data.title,
        content: data.content,
        priority: data.priority ?? 0,
        category: data.category,
        isActive: data.isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/staff-rules/:id - Обновить правило
router.patch('/:id', validateRequest(UpdateStaffRuleDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const rule = await prisma.staffRule.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    res.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/staff-rules/:id - Удалить правило
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.staffRule.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Staff rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
