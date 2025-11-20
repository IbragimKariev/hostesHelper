import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Копия функции normalizeWalls из halls.ts
const normalizeWalls = (walls: any[]) => {
  if (!Array.isArray(walls)) return [];

  return walls.map(wall => ({
    ...wall,
    type: wall.type || 'wall',
  }));
};

async function checkApiResponse() {
  console.log('🔍 Проверяем, что возвращает API...\n');

  try {
    // Получаем зал который мы только что обновили
    const hall = await prisma.hall.findFirst({
      where: { name: 'Летняя терраса' },
    });

    if (!hall) {
      console.log('❌ Зал не найден');
      return;
    }

    console.log('📦 Данные из БД (hall.walls):');
    const dbWalls = hall.walls as any[];
    console.log(JSON.stringify(dbWalls, null, 2));

    console.log('\n🔄 После normalizeWalls():');
    const normalizedWalls = normalizeWalls(dbWalls);
    console.log(JSON.stringify(normalizedWalls, null, 2));

    // Проверяем каждую стену
    console.log('\n📊 Детальная проверка:');
    normalizedWalls.forEach((wall: any, index: number) => {
      const original = dbWalls[index];
      console.log(`  ${index + 1}. ID: ${wall.id}`);
      console.log(`     БД type: ${original.type || 'undefined'}`);
      console.log(`     После normalize: ${wall.type}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiResponse();
