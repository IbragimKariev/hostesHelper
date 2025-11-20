import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateHallDto, UpdateHallDto, Wall } from '@hostes/shared';

const router = Router();

// Функция для нормализации walls - добавляет wallType: 'wall' если он отсутствует
const normalizeWalls = (walls: any[]): Wall[] => {
  if (!Array.isArray(walls)) return [];

  return walls.map(wall => {
    // Проверяем, что wallType существует и не пустой
    const wallType = wall.wallType && wall.wallType.trim() !== '' ? wall.wallType : 'wall';

    return {
      ...wall,
      wallType: wallType,
    };
  });
};

// GET /api/halls - Get all halls
router.get('/', async (req, res, next) => {
  try {
    const halls = await prisma.hall.findMany({
      include: {
        tables: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const formattedHalls = halls.map(hall => ({
      ...hall,
      sections: hall.sections as any,
      walls: normalizeWalls(hall.walls as any),
      tables: hall.tables.map(table => ({
        id: table.id,
        number: table.number,
        seats: table.seats,
        shape: table.shape,
        position: { x: table.positionX, y: table.positionY },
        size: { width: table.sizeWidth, height: table.sizeHeight },
        status: table.status,
        section: table.section,
        rotation: table.rotation,
        seatConfiguration: table.seatConfiguration,
        hallId: table.hallId,
      })),
    }));

    res.json({
      success: true,
      data: formattedHalls,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/halls/:id - Get hall by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const hall = await prisma.hall.findUnique({
      where: { id },
      include: {
        tables: true,
      },
    });

    if (!hall) {
      return res.status(404).json({
        success: false,
        error: 'Hall not found',
      });
    }

    const formattedHall = {
      ...hall,
      sections: hall.sections as any,
      walls: normalizeWalls(hall.walls as any),
      tables: hall.tables.map(table => ({
        id: table.id,
        number: table.number,
        seats: table.seats,
        shape: table.shape,
        position: { x: table.positionX, y: table.positionY },
        size: { width: table.sizeWidth, height: table.sizeHeight },
        status: table.status,
        section: table.section,
        rotation: table.rotation,
        seatConfiguration: table.seatConfiguration,
        hallId: table.hallId,
      })),
    };

    res.json({
      success: true,
      data: formattedHall,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/halls - Create new hall
router.post('/', validateRequest(CreateHallDto), async (req, res, next) => {
  try {
    const data = req.body;

    const hall = await prisma.hall.create({
      data: {
        name: data.name,
        width: data.width,
        height: data.height,
        pixelRatio: data.pixelRatio || 50,
        sections: data.sections || [],
        walls: data.walls || [],
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...hall,
        sections: hall.sections as any,
        walls: normalizeWalls(hall.walls as any),
        tables: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/halls/:id - Update hall
router.patch('/:id', validateRequest(UpdateHallDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const hall = await prisma.hall.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.pixelRatio !== undefined && { pixelRatio: data.pixelRatio }),
        ...(data.sections !== undefined && { sections: data.sections }),
        ...(data.walls !== undefined && { walls: data.walls }),
      },
      include: {
        tables: true,
      },
    });

    const formattedHall = {
      ...hall,
      sections: hall.sections as any,
      walls: normalizeWalls(hall.walls as any),
      tables: hall.tables.map(table => ({
        id: table.id,
        number: table.number,
        seats: table.seats,
        shape: table.shape,
        position: { x: table.positionX, y: table.positionY },
        size: { width: table.sizeWidth, height: table.sizeHeight },
        status: table.status,
        section: table.section,
        rotation: table.rotation,
        seatConfiguration: table.seatConfiguration,
        hallId: table.hallId,
      })),
    };

    res.json({
      success: true,
      data: formattedHall,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/halls/:id - Delete hall
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.hall.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Hall deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
