import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Очистка базы данных
  await prisma.reservation.deleteMany();
  await prisma.table.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Создание ролей
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
    },
  });

  const hostessRole = await prisma.role.create({
    data: {
      name: 'hostess',
    },
  });

  console.log('✅ Roles created');

  // Создание пользователей (пароли: admin123 и hostess123)
  // В реальном приложении пароли должны быть захешированы с помощью bcrypt
  await prisma.user.create({
    data: {
      name: 'Администратор',
      login: 'admin',
      password: 'admin123', // TODO: хешировать пароль
      roleId: adminRole.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Хостес',
      login: 'hostess',
      password: 'hostess123', // TODO: хешировать пароль
      roleId: hostessRole.id,
    },
  });

  console.log('✅ Users created');

  // Создание залов
  const mainHall = await prisma.hall.create({
    data: {
      name: 'Основной зал',
      width: 12,
      height: 8,
      pixelRatio: 50,
      sections: [
        { id: '1', name: 'Основная зона', color: '#e3f2fd' },
        { id: '2', name: 'VIP зона', color: '#fff3cd' },
      ],
      walls: [
        { id: 'wall-1', start: { x: 0, y: 0 }, end: { x: 12, y: 0 } },
        { id: 'wall-2', start: { x: 0, y: 0 }, end: { x: 0, y: 8 } },
        { id: 'wall-3', start: { x: 12, y: 0 }, end: { x: 12, y: 8 } },
        { id: 'wall-4', start: { x: 0, y: 8 }, end: { x: 12, y: 8 } },
      ],
    },
  });

  const terrace = await prisma.hall.create({
    data: {
      name: 'Летняя терраса',
      width: 10,
      height: 6,
      pixelRatio: 50,
      sections: [{ id: '1', name: 'Терраса', color: '#e8f5e8' }],
      walls: [
        { id: 'wall-5', start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
        { id: 'wall-6', start: { x: 0, y: 0 }, end: { x: 0, y: 6 } },
        { id: 'wall-7', start: { x: 10, y: 0 }, end: { x: 10, y: 6 } },
      ],
    },
  });

  const banquetHall = await prisma.hall.create({
    data: {
      name: 'Банкетный зал',
      width: 15,
      height: 10,
      pixelRatio: 50,
      sections: [{ id: '1', name: 'Основная зона', color: '#f8f0fc' }],
      walls: [
        { id: 'wall-8', start: { x: 0, y: 0 }, end: { x: 15, y: 0 } },
        { id: 'wall-9', start: { x: 0, y: 0 }, end: { x: 0, y: 10 } },
        { id: 'wall-10', start: { x: 15, y: 0 }, end: { x: 15, y: 10 } },
        { id: 'wall-11', start: { x: 0, y: 10 }, end: { x: 15, y: 10 } },
      ],
    },
  });

  const barArea = await prisma.hall.create({
    data: {
      name: 'Барная зона',
      width: 8,
      height: 6,
      pixelRatio: 50,
      sections: [{ id: '1', name: 'Бар', color: '#fff3cd' }],
      walls: [
        { id: 'wall-12', start: { x: 0, y: 0 }, end: { x: 8, y: 0 } },
        { id: 'wall-13', start: { x: 0, y: 0 }, end: { x: 0, y: 6 } },
        { id: 'wall-14', start: { x: 8, y: 0 }, end: { x: 8, y: 6 } },
      ],
    },
  });

  console.log('✅ Halls created');

  // Создание столиков для основного зала
  const table1 = await prisma.table.create({
    data: {
      number: 1,
      seats: 4,
      shape: 'rectangle',
      positionX: 2,
      positionY: 2,
      sizeWidth: 1.2,
      sizeHeight: 1.2,
      status: 'available',
      section: '1',
      rotation: 0,
      seatConfiguration: 'default-4',
      hallId: mainHall.id,
    },
  });

  const table2 = await prisma.table.create({
    data: {
      number: 2,
      seats: 2,
      shape: 'rectangle',
      positionX: 5,
      positionY: 3,
      sizeWidth: 0.8,
      sizeHeight: 0.8,
      status: 'available',
      section: '1',
      rotation: 0,
      seatConfiguration: 'default-2',
      hallId: mainHall.id,
    },
  });

  const table3 = await prisma.table.create({
    data: {
      number: 3,
      seats: 6,
      shape: 'circle',
      positionX: 8,
      positionY: 2,
      sizeWidth: 1.5,
      sizeHeight: 1.5,
      status: 'available',
      section: '1',
      rotation: 45,
      seatConfiguration: 'circle-6',
      hallId: mainHall.id,
    },
  });

  const table4 = await prisma.table.create({
    data: {
      number: 4,
      seats: 8,
      shape: 'rectangle',
      positionX: 3,
      positionY: 5,
      sizeWidth: 2.0,
      sizeHeight: 1.0,
      status: 'available',
      section: '2',
      rotation: 0,
      seatConfiguration: 'default-8',
      hallId: mainHall.id,
    },
  });

  // Столики для террасы
  await prisma.table.createMany({
    data: [
      {
        number: 1,
        seats: 4,
        shape: 'rectangle',
        positionX: 2,
        positionY: 2,
        sizeWidth: 1.2,
        sizeHeight: 1.2,
        status: 'available',
        section: '1',
        rotation: 0,
        seatConfiguration: 'default-4',
        hallId: terrace.id,
      },
      {
        number: 2,
        seats: 6,
        shape: 'circle',
        positionX: 6,
        positionY: 2,
        sizeWidth: 1.5,
        sizeHeight: 1.5,
        status: 'available',
        section: '1',
        rotation: 0,
        seatConfiguration: 'circle-6',
        hallId: terrace.id,
      },
      {
        number: 3,
        seats: 2,
        shape: 'rectangle',
        positionX: 4,
        positionY: 4,
        sizeWidth: 0.8,
        sizeHeight: 0.8,
        status: 'available',
        section: '1',
        rotation: 90,
        seatConfiguration: 'default-2',
        hallId: terrace.id,
      },
    ],
  });

  // Столики для банкетного зала
  await prisma.table.createMany({
    data: [
      {
        number: 1,
        seats: 12,
        shape: 'circle',
        positionX: 5,
        positionY: 3,
        sizeWidth: 2.5,
        sizeHeight: 2.5,
        status: 'available',
        section: '1',
        rotation: 0,
        seatConfiguration: 'circle-12',
        hallId: banquetHall.id,
      },
      {
        number: 2,
        seats: 8,
        shape: 'rectangle',
        positionX: 10,
        positionY: 3,
        sizeWidth: 2.0,
        sizeHeight: 1.0,
        status: 'available',
        section: '1',
        rotation: 90,
        seatConfiguration: 'default-8',
        hallId: banquetHall.id,
      },
      {
        number: 3,
        seats: 12,
        shape: 'oval',
        positionX: 7,
        positionY: 7,
        sizeWidth: 3.0,
        sizeHeight: 1.5,
        status: 'available',
        section: '1',
        rotation: 0,
        seatConfiguration: 'oval-8',
        hallId: banquetHall.id,
      },
    ],
  });

  // Столики для барной зоны
  await prisma.table.createMany({
    data: [
      {
        number: 1,
        seats: 4,
        shape: 'rectangle',
        positionX: 1,
        positionY: 1,
        sizeWidth: 1.2,
        sizeHeight: 1.2,
        status: 'available',
        section: '1',
        rotation: 45,
        hallId: barArea.id,
      },
      {
        number: 2,
        seats: 2,
        shape: 'rectangle',
        positionX: 4,
        positionY: 1,
        sizeWidth: 0.8,
        sizeHeight: 0.8,
        status: 'available',
        section: '1',
        rotation: 0,
        hallId: barArea.id,
      },
      {
        number: 3,
        seats: 6,
        shape: 'circle',
        positionX: 6,
        positionY: 4,
        sizeWidth: 1.5,
        sizeHeight: 1.5,
        status: 'available',
        section: '1',
        rotation: 0,
        hallId: barArea.id,
      },
    ],
  });

  console.log('✅ Tables created');

  // Создание тестовых бронирований
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  await prisma.reservation.createMany({
    data: [
      {
        tableId: table1.id,
        tableNumber: 1,
        hallId: mainHall.id,
        customerName: 'Иван Иванов',
        customerPhone: '+7 (912) 345-67-89',
        guests: 4,
        date: today,
        time: '19:00',
        duration: 2,
        status: 'confirmed',
        specialRequests: 'У окна, если возможно',
      },
      {
        tableId: table2.id,
        tableNumber: 2,
        hallId: mainHall.id,
        customerName: 'Мария Петрова',
        customerPhone: '+7 (923) 456-78-90',
        guests: 2,
        date: today,
        time: '20:00',
        duration: 1.5,
        status: 'pending',
        specialRequests: 'День рождения',
      },
      {
        tableId: table3.id,
        tableNumber: 3,
        hallId: mainHall.id,
        customerName: 'Дмитрий Смирнов',
        customerPhone: '+7 (956) 789-01-23',
        guests: 6,
        date: dayAfterTomorrow,
        time: '21:00',
        duration: 2,
        status: 'pending',
        specialRequests: 'Вечеринка',
      },
    ],
  });

  console.log('✅ Reservations created');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
