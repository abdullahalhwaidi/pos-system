// src/services/categoryService.js
import prisma from '../config/prisma.js';

// 1. Get all categories with product count
export const getCategoriesService = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

// 2. Create a new category
export const createCategoryService = async (categoryData) => {
  const { name } = categoryData;

  if (!name || String(name).trim() === '') {
    const error = new Error('Category name is required');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.category.create({
    data: {
      name: String(name).trim()
    }
    
  });
};

// 3. Delete a category
export const deleteCategoryService = async (id) => {
  if (!id) {
    const error = new Error('Category ID is required');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.category.delete({
    where: { id }
  });
};