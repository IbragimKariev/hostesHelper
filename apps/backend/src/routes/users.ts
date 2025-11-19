import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { CreateUserDto, UpdateUserDto } from '@hostes/shared';
import { logger } from '../utils/logger';

const router = Router();

// Получить всех пользователей
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    // Удаляем пароли из ответа
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json({
      success: true,
      data: usersWithoutPasswords,
    });
  } catch (error) {
    next(error);
  }
});

// Получить пользователя по ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// Создать пользователя (только для админа)
router.post('/', validateRequest(CreateUserDto), async (req, res, next) => {
  try {
    const { name, login, password, roleId } = req.body;

    // Проверка, существует ли пользователь с таким логином
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким логином уже существует',
      });
    }

    // TODO: Хешировать пароль с помощью bcrypt
    const user = await prisma.user.create({
      data: {
        name,
        login,
        password, // TODO: хешированный пароль
        roleId,
      },
      include: { role: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User created: ${user.login}`);

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// Обновить пользователя
router.patch('/:id', validateRequest(UpdateUserDto), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
    }

    // Если обновляется логин, проверить уникальность
    if (updates.login && updates.login !== existingUser.login) {
      const userWithLogin = await prisma.user.findUnique({
        where: { login: updates.login },
      });

      if (userWithLogin) {
        return res.status(400).json({
          success: false,
          error: 'Пользователь с таким логином уже существует',
        });
      }
    }

    // TODO: Если обновляется пароль, хешировать его

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      include: { role: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User updated: ${user.login}`);

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// Удалить пользователя
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден',
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    logger.info(`User deleted: ${user.login}`);

    res.json({
      success: true,
      message: 'Пользователь удален',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
