import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { main as seedDatabase } from './prisma/seed.js'; 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);

// ---------------------------------------------------------
// Global Error Handler Middleware
// Catches any error passed from next(error) across all Controllers
// ---------------------------------------------------------
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Handle Prisma Duplicate Unique Constraint error (e.g., duplicate barcode or category name)
  if (err.code === 'P2002') {
    return res.status(400).json({
      errorCode: 'DUPLICATE_ENTRY',
      message: 'Resource or unique field already exists'
    });
  }

  return res.status(statusCode).json({
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
    // Expose stack trace details only during Development environment
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// 👈 
app.listen(PORT, async () => {
  console.log(`🚀 Server running successfully on port: http://localhost:${PORT}`);
  
  // 👈 
  try {
    await seedDatabase();
  } catch (error) {
    console.error('❌ Failed to run database seed on startup:', error);
  }
});