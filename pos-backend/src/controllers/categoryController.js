// src/controllers/categoryController.js
import { 
  getCategoriesService, 
  createCategoryService, 
  deleteCategoryService 
} from '../services/categoryService.js';

// 1. Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ 
      error: 'An error occurred while fetching categories', 
      details: error.message 
    });
  }
};

// 2. Create a new category
export const createCategory = async (req, res) => {
  try {
    const category = await createCategoryService(req.body);
    return res.status(201).json({ 
      message: 'Category created successfully', 
      category 
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    return res.status(error.statusCode || 500).json({ 
      error: error.message || 'Failed to create category', 
      details: error.statusCode ? undefined : error.message 
    });
  }
};

// 3. Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCategoryService(id);
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ 
      error: error.message || 'Failed to delete category or it does not exist' 
    });
  }
};