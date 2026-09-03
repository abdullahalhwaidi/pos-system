import prisma from '../config/prisma.js';

// 1. جلب جميع التصنيفات/الأقسام
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true } // يرجع عدد المنتجات التابعة لكل قسم
        }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التصنيفات', details: error.message });
  }
};

// 2. إضافة تصنيف جديد
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'اسم التصنيف مطلوب' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({ message: 'تم إضافة التصنيف بنجاح', category });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'اسم التصنيف موجود بالفعل' });
    }
    res.status(500).json({ error: 'تعذر إضافة التصنيف', details: error.message });
  }
};

// 3. حذف تصنيف
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'تم حذف التصنيف بنجاح' });
  } catch (error) {
    res.status(400).json({ error: 'تعذر حذف التصنيف أو أنه غير موجود' });
  }
};