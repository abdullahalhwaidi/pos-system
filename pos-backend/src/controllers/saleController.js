import prisma from '../config/prisma.js';

// إتمام عملية بيع وخصم الكميات المباعة من المخزون تلقائياً
export const createSale = async (req, res) => {
  const { invoiceNumber, items, totalAmount, taxAmount, discount, paymentMethod } = req.body;
  
  // أخذ رقم الكاشير/المستخدم تلقائياً من التوكن المفحوص عبر auth middleware
  const userId = req.user?.id || req.body.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'السلة فارغة، لا يمكن إتمام العملية' });
  }

  try {
    // استخدام Prisma Transaction لضمان إنشاء الفاتورة وخصم المخزون كعملية واحدة متكاملة
    const result = await prisma.$transaction(async (tx) => {
      // 1. إنشاء سجل الفاتورة وتفاصيل المواد المباعة
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          totalAmount: parseFloat(totalAmount),
          taxAmount: parseFloat(taxAmount || 0),
          discount: parseFloat(discount || 0),
          paymentMethod: paymentMethod || 'CASH',
          userId: userId ? parseInt(userId) : null,
          items: {
            create: items.map(item => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              subtotal: parseFloat(item.subtotal || (item.unitPrice * item.quantity))
            }))
          }
        },
        include: { items: true }
      });

      // 2. تحديث وتخفيض الكمية المتاحة في المخزون لكل منتج تم بيعه
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { stock: { decrement: parseInt(item.quantity) } }
        });
      }

      return sale;
    });

    res.status(201).json({ message: 'تمت عملية البيع وخصم المخزون بنجاح', sale: result });
  } catch (error) {
    res.status(500).json({ error: 'فشلت عملية البيع وتحديث المخزون', details: error.message });
  }
};

// إتاحة دالة جلب الفواتير (لشاشة السجل والتقارير)
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب سجل المبيعات', details: error.message });
  }
};