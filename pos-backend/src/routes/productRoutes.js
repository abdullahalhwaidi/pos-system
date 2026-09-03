import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// جلب المنتجات متاح لجميع المستخدمين المسجلين
router.get('/', authenticateToken, getProducts);

// إضافة منتج جديد
router.post('/', authenticateToken, createProduct);

export default router;