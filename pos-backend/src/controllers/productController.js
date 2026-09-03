import prisma from '../config/prisma.js';

// 1. Get all products with category
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
};

// 2. Create a new product
export const createProduct = async (req, res) => {
  const { barcode, name, price, costPrice, stock, categoryId } = req.body;

  try {
    // Validate required fields
    if (!barcode || !name || price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Please enter barcode, product name, and price' });
    }

    // Safely parse costPrice and prevent NaN
    const parsedCostPrice = (costPrice !== undefined && costPrice !== null && costPrice !== '') 
      ? parseFloat(costPrice) 
      : 0.0;

    // Ensure valid category ID string or assign default category
    let validCategoryId = categoryId ? String(categoryId).trim() : null;

    if (!validCategoryId) {
      let defaultCategory = await prisma.category.findFirst();
      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: { name: 'General' }
        });
      }
      validCategoryId = defaultCategory.id;
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        barcode: String(barcode).trim(),
        name: String(name).trim(),
        price: parseFloat(price),
        costPrice: isNaN(parsedCostPrice) ? 0.0 : parsedCostPrice,
        stock: stock ? parseInt(stock) : 0,
        categoryId: validCategoryId
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Barcode is already registered for another product' });
    }

    res.status(400).json({
      error: 'Failed to create product, please verify the data',
      details: error.message
    });
  }
};