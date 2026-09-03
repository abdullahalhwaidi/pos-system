import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Clean the table to avoid duplication
  await prisma.user.deleteMany();

  // Seed default accounts
  await prisma.user.createMany({
    data: [
      {
        name: 'admin',
        email: 'admin@pos.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
      {
        name: 'cashier',
        email: 'cashier@pos.com',
        password: hashedPassword,
        role: 'CASHIER',
      },
    ],
  });

  console.log('✅ Admin and cashier accounts seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });