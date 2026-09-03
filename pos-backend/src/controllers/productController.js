import prisma from '../config/prisma.js';

// 1. جلب جميع المنتجات مع التصنيف
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المنتجات', details: error.message });
  }
};

// 2. إضافة منتج جديد
export const createProduct = async (req, res) => {
  const { barcode, name, price, costPrice, stock, categoryId } = req.body;

  try {
    // التحقق من الحقول الأساسية
    if (!barcode || !name || price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'يرجى إدخال الباركود، اسم المنتج، والسعر' });
    }

    // معالجة costPrice بشكل آمن وتجنب NaN
    const parsedCostPrice = (costPrice !== undefined && costPrice !== null && costPrice !== '') 
      ? parseFloat(costPrice) 
      : 0.0;

    // التأكد من وجود ID القسم وإلا إسناد القسم الافتراضي
    let validCategoryId = categoryId ? parseInt(categoryId) : null;

    if (!validCategoryId || isNaN(validCategoryId)) {
      let defaultCategory = await prisma.category.findFirst();
      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: { name: 'عام' }
        });
      }
      validCategoryId = defaultCategory.id;
    }

    // إنشاء المنتج
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
      return res.status(400).json({ error: 'الباركود مُسجل لمنتج آخر بالفعل' });
    }

    res.status(400).json({
      error: 'تعذر إضافة المنتج، تحقق من البيانات',
      details: error.message
    });
  }
};