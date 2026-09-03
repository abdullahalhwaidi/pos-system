import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// تطبيق الحماية على مسارات المبيعات والفواتير
router.get('/', authenticateToken, getSales);
router.post('/', authenticateToken, createSale);

export default router;