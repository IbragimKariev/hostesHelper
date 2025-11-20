import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestWalls() {
  console.log('➕ Добавляем тестовые окно и вход в Барную зону...\n');

  try {
    const hall = await prisma.hall.findFirst({ where: { name: 'Барная зона' } });

    if (!hall) {
      console.log('❌ Зал Барная зона не найден');
      return;
    }

    const currentWalls = hall.walls as any[];

    // Добавляем окно и вход
    const testWindow = {
      id: `window-${Date.now()}`,
      start: { x: 0, y: 3 },
      end: { x: 2, y: 3 },
      type: 'window',
    };

    const testEntrance = {
      id: `entrance-${Date.now()}`,
      start: { x: 4, y: 0 },
      end: { x: 5, y: 0 },
      type: 'entrance',
    };

    const updatedWalls = [...currentWalls, testWindow, testEntrance];

    await prisma.hall.update({
      where: { id: hall.id },
      data: { walls: updatedWalls as any },
    });

    console.log('✅ Добавлено:');
    console.log(`  🪟 Окно: ${testWindow.id}`);
    console.log(`  🚪 Вход: ${testEntrance.id}`);
    console.log('\n💡 Теперь перезагрузите фронтенд и увидите окно (синее) и вход (зеленый)!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestWalls();
