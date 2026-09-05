// src/controllers/productController.js
import { getAllProductsService, createProductService } from '../services/productService.js';

// 1. Fetch products API
export const getProducts = async (req, res) => {
  try {
    const products = await getAllProductsService();
    return res.json(products);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ 
      error: error.message || 'Failed to fetch products' 
    });
  }
};

// 2. Create product API
export const createProduct = async (req, res) => {
  try {
    // Calls the Service layer passing only req.body data
    const newProduct = await createProductService(req.body);
    return res.status(201).json(newProduct);
  } catch (error) {
    // Handle Prisma duplicate barcode constraint error (P2002)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Barcode is already registered for another product' });
    }

    return res.status(error.statusCode || 400).json({
      error: error.message || 'Failed to create product',
    });
  }
};