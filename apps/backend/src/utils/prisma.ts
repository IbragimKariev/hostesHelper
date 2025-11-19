import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query}`);
});

prisma.$on('error', (e) => {
  logger.error(`Error: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Warning: ${e.message}`);
});

export { prisma };
