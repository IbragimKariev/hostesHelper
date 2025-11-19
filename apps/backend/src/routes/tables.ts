import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateTableDto, UpdateTableDto } from '@hostes/shared';

const router = Router();

// GET /api/tables - Get all tables (optionally filtered by hallId)
router.get('/', async (req, res, next) => {
  try {
    const { hallId } = req.query;

    const tables = await prisma.table.findMany({
      where: hallId ? { hallId: hallId as string } : undefined,
      orderBy: [
        { hallId: 'asc' },
        { number: 'asc' },
      ],
    });

    const formattedTables = tables.map(table => ({
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
    }));

    res.json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tables/:id - Get table by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        hall: true,
        reservations: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    const formattedTable = {
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
      hall: table.hall,
      reservations: table.reservations,
    };

    res.json({
      success: true,
      data: formattedTable,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables - Create new table
router.post('/', validateRequest(CreateTableDto), async (req, res, next) => {
  try {
    const data = req.body;

    const table = await prisma.table.create({
      data: {
        number: data.number,
        seats: data.seats,
        shape: data.shape,
        positionX: data.position.x,
        positionY: data.position.y,
        sizeWidth: data.size.width,
        sizeHeight: data.size.height,
        status: data.status || 'available',
        section: data.section,
        rotation: data.rotation || 0,
        seatConfiguration: data.seatConfiguration,
        hallId: data.hallId,
      },
    });

    const formattedTable = {
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
    };

    res.status(201).json({
      success: true,
      data: formattedTable,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tables/:id - Update table
router.patch('/:id', validateRequest(UpdateTableDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updateData: any = {};

    if (data.number !== undefined) updateData.number = data.number;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.shape !== undefined) updateData.shape = data.shape;
    if (data.position !== undefined) {
      updateData.positionX = data.position.x;
      updateData.positionY = data.position.y;
    }
    if (data.size !== undefined) {
      updateData.sizeWidth = data.size.width;
      updateData.sizeHeight = data.size.height;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.section !== undefined) updateData.section = data.section;
    if (data.rotation !== undefined) updateData.rotation = data.rotation;
    if (data.seatConfiguration !== undefined) updateData.seatConfiguration = data.seatConfiguration;
    if (data.hallId !== undefined) updateData.hallId = data.hallId;

    const table = await prisma.table.update({
      where: { id },
      data: updateData,
    });

    const formattedTable = {
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
    };

    res.json({
      success: true,
      data: formattedTable,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tables/:id - Delete table
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.table.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables/bulk - Create multiple tables
router.post('/bulk', async (req, res, next) => {
  try {
    const { tables } = req.body;

    if (!Array.isArray(tables)) {
      return res.status(400).json({
        success: false,
        error: 'Expected an array of tables',
      });
    }

    const createdTables = await prisma.$transaction(
      tables.map(data =>
        prisma.table.create({
          data: {
            number: data.number,
            seats: data.seats,
            shape: data.shape,
            positionX: data.position.x,
            positionY: data.position.y,
            sizeWidth: data.size.width,
            sizeHeight: data.size.height,
            status: data.status || 'available',
            section: data.section,
            rotation: data.rotation || 0,
            seatConfiguration: data.seatConfiguration,
            hallId: data.hallId,
          },
        })
      )
    );

    const formattedTables = createdTables.map(table => ({
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
    }));

    res.status(201).json({
      success: true,
      data: formattedTables,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
