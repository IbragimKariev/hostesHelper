import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWallTypes() {
  try {
    console.log('🔧 Начинаем миграцию: переименование "type" → "wallType" в walls\n');

    const halls = await prisma.hall.findMany({
      select: {
        id: true,
        name: true,
        walls: true,
      },
    });

    let totalHallsUpdated = 0;
    let totalWallsFixed = 0;

    for (const hall of halls) {
      const walls = hall.walls as any[];

      if (!walls || walls.length === 0) {
        continue;
      }

      let hasChanges = false;
      const fixedWalls = walls.map((wall) => {
        // Если есть старое поле 'type', но нет 'wallType'
        if ('type' in wall && !('wallType' in wall)) {
          hasChanges = true;
          totalWallsFixed++;

          // Создаем новый объект с wallType вместо type
          const { type, ...rest } = wall;
          return {
            ...rest,
            wallType: type, // Переименовываем type → wallType
          };
        }

        // Если wallType уже есть, оставляем как есть
        return wall;
      });

      if (hasChanges) {
        console.log(`📍 Обновляем зал: ${hall.name}`);
        console.log(`   Исправлено стен: ${totalWallsFixed}`);

        await prisma.hall.update({
          where: { id: hall.id },
          data: { walls: fixedWalls },
        });

        totalHallsUpdated++;
      }
    }

    console.log(`\n✅ Миграция завершена:`);
    console.log(`   Обновлено залов: ${totalHallsUpdated}`);
    console.log(`   Исправлено стен: ${totalWallsFixed}`);
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixWallTypes();
