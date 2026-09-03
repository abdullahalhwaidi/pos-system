import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, email, password } = req.body;
  
  // قبول إما username أو email القادم من الفرونت إند
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة السر' });
  }

  try {
    // البحث عن المستخدم باسمه أو بريده الإلكتروني
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: identifier },
          { email: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'كلمة السر غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    // إرجاع الاستجابة متوافقة مع الفرونت إند (إرجاع role مباشر وتغيير صيغته للحروف الصغيرة)
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      role: userRole, // تحويل ADMIN / CASHIER إلى admin / cashier
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ أثناء تسجيل الدخول', details: error.message });
  }
};