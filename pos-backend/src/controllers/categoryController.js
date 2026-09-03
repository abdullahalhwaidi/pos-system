import prisma from '../config/prisma.js';

// 1. Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true } // Returns the count of products associated with each category
        }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching categories', details: error.message });
  }
};

// 2. Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
};

// 3. Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete category or it does not exist' });
  }
};