// src/controllers/saleController.js
import { createSaleService, getSalesService } from '../services/saleService.js';

// 1. Create sale
export const createSale = async (req, res, next) => {
  try {
    const sale = await createSaleService(req.body, req.user?.id);
    return res.status(201).json({
      message: 'Sale completed and stock updated successfully',
      sale
    });
  } catch (error) {
    next(error); // Pass error to global error handler middleware
  }
};

// 2. Fetch sales history
export const getSales = async (req, res, next) => {
  try {
    const sales = await getSalesService();
    return res.json(sales);
  } catch (error) {
    next(error);
  }
};