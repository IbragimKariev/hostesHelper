import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWallTypes() {
  console.log('🧪 Тестирование типов стен...\n');

  try {
    // Получаем первый зал
    const hall = await prisma.hall.findFirst();

    if (!hall) {
      console.log('❌ Залы не найдены');
      return;
    }

    console.log(`📍 Используем зал: "${hall.name}" (ID: ${hall.id})\n`);

    // Текущие стены
    const currentWalls = hall.walls as any[];
    console.log('📊 Текущие стены:', JSON.stringify(currentWalls, null, 2));

    // Создаем тестовое окно
    const testWindow = {
      id: `test-window-${Date.now()}`,
      start: { x: 1, y: 1 },
      end: { x: 2, y: 1 },
      type: 'window',
    };

    // Создаем тестовый вход
    const testEntrance = {
      id: `test-entrance-${Date.now()}`,
      start: { x: 3, y: 1 },
      end: { x: 4, y: 1 },
      type: 'entrance',
    };

    console.log('\n➕ Добавляем тестовое окно:', JSON.stringify(testWindow, null, 2));
    console.log('➕ Добавляем тестовый вход:', JSON.stringify(testEntrance, null, 2));

    // Обновляем зал
    const updatedWalls = [...currentWalls, testWindow, testEntrance];

    const updated = await prisma.hall.update({
      where: { id: hall.id },
      data: { walls: updatedWalls as any },
    });

    console.log('\n💾 Стены после сохранения в БД:');
    const savedWalls = updated.walls as any[];
    savedWalls.forEach((wall: any, index: number) => {
      console.log(`  ${index + 1}. ID: ${wall.id}, Type: ${wall.type || 'НЕТ ТИПА!'}`);
    });

    // Проверяем, что типы сохранились
    const windowFound = savedWalls.find((w: any) => w.id === testWindow.id);
    const entranceFound = savedWalls.find((w: any) => w.id === testEntrance.id);

    console.log('\n✅ Результаты проверки:');
    console.log(`  Окно: type="${windowFound?.type}" (ожидается "window")`);
    console.log(`  Вход: type="${entranceFound?.type}" (ожидается "entrance")`);

    if (windowFound?.type === 'window' && entranceFound?.type === 'entrance') {
      console.log('\n🎉 Тест ПРОЙДЕН! Типы сохраняются правильно.');
    } else {
      console.log('\n❌ Тест ПРОВАЛЕН! Типы не сохраняются.');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWallTypes();
