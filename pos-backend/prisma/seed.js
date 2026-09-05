// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. إنشاء حساب المسؤول Manager/Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@pos.com',
      password: hashedPassword,
      role: 'ADMIN', // أو MANAGER حسب المخطط لديك
    },
  });

  // 2. إنشاء حساب الكاشير Cashier
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {},
    create: {
      name: 'cashier',
      email: 'cashier@pos.com',
      password: hashedPassword,
      role: 'CASHIER',
    },
  });

  console.log('✅ Default users seeded successfully:', { admin: admin.name, cashier: cashier.name });
}

// تنفيذ الـ Seed إذا تم تشغيل الملف مباشرة من الـ Terminal
if (process.argv[1].includes('seed.js')) {
  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}