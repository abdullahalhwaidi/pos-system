import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// تطبيق الحماية على مسارات التصنيفات
router.get('/', authenticateToken, getCategories);
router.post('/', authenticateToken, createCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;