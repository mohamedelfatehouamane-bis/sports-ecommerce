const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findFirst({ where: { name: 'QA Discount Test Product' } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
