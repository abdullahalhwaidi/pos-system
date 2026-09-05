// src/services/productService.js
import prisma from '../config/prisma.js';

// 1. Fetch all products (Business logic only)
export const getAllProductsService = async () => {
  return await prisma.product.findMany({
    include: { category: true }
  });
};

// 2. Create a new product (Business logic + Prisma + Data sanitization)
export const createProductService = async (productData) => {
  const { barcode, name, price, costPrice, stock, categoryId } = productData;

  // Validate required fields
  if (!barcode || !name || price === undefined || price === null || price === '') {
    const error = new Error('Please enter barcode, product name, and price');
    error.statusCode = 400;
    error.errorCode = 'REQUIRED_FIELDS_MISSING';
    throw error;
  }

  // Sanitize cost price
  const parsedCostPrice = (costPrice !== undefined && costPrice !== null && costPrice !== '') 
    ? parseFloat(costPrice) 
    : 0.0;

  // Validate or assign default category
  let validCategoryId = categoryId ? String(categoryId).trim() : null;

  if (!validCategoryId) {
    let defaultCategory = await prisma.category.findFirst();
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: { name: 'General' }
      });
    }
    validCategoryId = defaultCategory.id;
  }

  // Save product to database via Prisma
  return await prisma.product.create({
    data: {
      barcode: String(barcode).trim(),
      name: String(name).trim(),
      price: parseFloat(price),
      costPrice: isNaN(parsedCostPrice) ? 0.0 : parsedCostPrice,
      stock: stock ? parseInt(stock) : 0,
      categoryId: validCategoryId
    }
  });
};