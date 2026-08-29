const jwt = require('jsonwebtoken');

// مفتاح سري للتشفير (في بيئة الإنتاج يتم وضعه في ملف env.)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_pos_key_2026';

// 1. Guard للتحقق من تسجيل الدخول (Authentication)
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'تنبيه أمني: يتطلب تسجيل الدخول للوصول' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // يحتوي عادة على { id, username, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'جلسة التوثيق غير صالحة أو منتهية الصلاحية' });
  }
};

// 2. Guard للتحقق من الصلاحيات والأدوار (Authorization) - 🔥 المضاف حديثاً
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // التأكد من أن المستخدم موجود ومعه دور مسموح به
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'عذراً، ليس لديك الصلاحية الكافية لتنفيذ هذه العملية' 
      });
    }
    next();
  };
};

module.exports = { authGuard, requireRole, JWT_SECRET };