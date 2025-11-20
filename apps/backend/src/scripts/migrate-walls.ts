import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Wall {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  type?: 'wall' | 'window' | 'entrance'; // Старое поле
  wallType?: 'wall' | 'window' | 'entrance'; // Новое поле
}

async function migrateWalls() {
  console.log('🔄 Начинаем миграцию walls...');

  try {
    // Получаем все залы
    const halls = await prisma.hall.findMany();
    console.log(`📊 Найдено залов: ${halls.length}`);

    let updatedCount = 0;
    let wallsUpdated = 0;

    for (const hall of halls) {
      const walls = hall.walls as any;

      if (!Array.isArray(walls) || walls.length === 0) {
        console.log(`⏭️  Зал "${hall.name}" - нет стен, пропускаем`);
        continue;
      }

      // Проверяем, нужна ли миграция (переименование type в wallType)
      const needsMigration = walls.some((wall: Wall) => !wall.wallType);

      if (!needsMigration) {
        console.log(`✅ Зал "${hall.name}" - все стены уже имеют wallType`);
        continue;
      }

      // Мигрируем: type -> wallType, удаляем старое поле type
      const updatedWalls: Wall[] = walls.map((wall: Wall) => {
        const { type, ...rest } = wall;
        return {
          ...rest,
          wallType: wall.wallType || wall.type || 'wall',
        };
      });

      // Сохраняем обновленные данные
      await prisma.hall.update({
        where: { id: hall.id },
        data: { walls: updatedWalls as any },
      });

      const wallsInHall = walls.filter((w: Wall) => !w.type).length;
      wallsUpdated += wallsInHall;
      updatedCount++;

      console.log(`✨ Зал "${hall.name}" - обновлено стен: ${wallsInHall}`);
    }

    console.log('\n✅ Миграция завершена!');
    console.log(`📈 Обновлено залов: ${updatedCount}`);
    console.log(`🧱 Обновлено стен: ${wallsUpdated}`);
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
migrateWalls()
  .then(() => {
    console.log('👍 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
