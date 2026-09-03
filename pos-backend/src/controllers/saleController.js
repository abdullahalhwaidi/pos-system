import prisma from '../config/prisma.js';

// Complete a sale transaction and automatically deduct sold quantities from stock
export const createSale = async (req, res) => {
  const { invoiceNumber, items, totalAmount, taxAmount, discount, paymentMethod } = req.body;
  
  // Extract user/cashier ID automatically from token verified via auth middleware
  const userId = req.user?.id || req.body.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty, operation cannot be completed' });
  }

  try {
    // Use Prisma Transaction to guarantee invoice creation and stock deduction execute as a single atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create sale record and line items details
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          totalAmount: parseFloat(totalAmount),
          taxAmount: parseFloat(taxAmount || 0),
          discount: parseFloat(discount || 0),
          paymentMethod: paymentMethod || 'CASH',
          userId: userId ? String(userId) : null,
          items: {
            create: items.map(item => ({
              productId: String(item.productId),
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              subtotal: parseFloat(item.subtotal || (item.unitPrice * item.quantity))
            }))
          }
        },
        include: { items: true }
      });

      // 2. Update and decrement available stock quantity for each sold product
      for (const item of items) {
        await tx.product.update({
          where: { id: String(item.productId) },
          data: { stock: { decrement: parseInt(item.quantity) } }
        });
      }

      return sale;
    });

    res.status(201).json({ message: 'Sale completed and stock updated successfully', sale: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete sale and update inventory', details: error.message });
  }
};

// Fetch sales invoices (for history and reporting screens)
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
    res.status(500).json({ error: 'An error occurred while fetching sales history', details: error.message });
  }
};