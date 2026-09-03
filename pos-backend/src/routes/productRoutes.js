import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Fetch products route - available to all authenticated users
router.get('/', authenticateToken, getProducts);

// Create new product route
router.post('/', authenticateToken, createProduct);

export default router;