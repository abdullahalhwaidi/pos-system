import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // تنظيف الجدول لتجنب التكرار
  await prisma.user.deleteMany();

  // إضافة الحسابات مباشرة
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

  console.log('✅ تم إضافة حسابات admin و cashier بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });