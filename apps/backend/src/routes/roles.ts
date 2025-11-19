import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// Получить все роли
router.get('/', async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
