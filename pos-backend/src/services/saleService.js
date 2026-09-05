// src/services/saleService.js
import prisma from '../config/prisma.js';

// 1. Create a sale transaction with stock update
export const createSaleService = async (saleData, authenticatedUserId) => {
  const { invoiceNumber, items, totalAmount, taxAmount, discount, paymentMethod, userId } = saleData;

  // Extract user ID from auth middleware token or fallback to request body
  const finalUserId = authenticatedUserId || userId;

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Cart is empty, operation cannot be completed');
    error.statusCode = 400;
    throw error;
  }

  // Execute sale creation and stock deduction as an atomic Prisma transaction
  return await prisma.$transaction(async (tx) => {
    // Optional check: Ensure stock availability before completing transaction
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: String(item.productId) }
      });

      if (!product) {
        const error = new Error(`Product with ID ${item.productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock < parseInt(item.quantity)) {
        const error = new Error(`Insufficient stock for product: ${product.name}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // 1. Create sale record and line items
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        totalAmount: parseFloat(totalAmount),
        taxAmount: parseFloat(taxAmount || 0),
        discount: parseFloat(discount || 0),
        paymentMethod: paymentMethod || 'CASH',
        userId: finalUserId ? String(finalUserId) : null,
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

    // 2. Decrement stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: String(item.productId) },
        data: { stock: { decrement: parseInt(item.quantity) } }
      });
    }

    return sale;
  });
};

// 2. Get sales history for reports
export const getSalesService = async () => {
  return await prisma.sale.findMany({
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};