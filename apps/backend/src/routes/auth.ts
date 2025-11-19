import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { LoginDto } from '@hostes/shared';
import { logger } from '../utils/logger';

const router = Router();

// Логин
router.post('/login', validateRequest(LoginDto), async (req, res, next) => {
  try {
    const { login, password } = req.body;

    // Найти пользователя по логину
    const user = await prisma.user.findUnique({
      where: { login },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверный логин или пароль',
      });
    }

    // Проверка пароля (пока простое сравнение, TODO: bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Неверный логин или пароль',
      });
    }

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    // TODO: Генерация JWT токена
    const token = `fake-jwt-token-${user.id}`;

    logger.info(`User logged in: ${user.login}`);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Проверка токена (получение текущего пользователя)
router.get('/me', async (req, res, next) => {
  try {
    // TODO: Извлечь userId из JWT токена в заголовке Authorization
    // Пока просто возвращаем ошибку
    res.status(401).json({
      success: false,
      error: 'Требуется авторизация',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
