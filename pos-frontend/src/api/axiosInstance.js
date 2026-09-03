import axios from 'axios';

// 1. إنشاء instance من axios بالمنفذ الصحيح (3000)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 2. إعداد Request Interceptor لإرفاق الـ Token تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. إعداد Response Interceptor لمعالجة انتهاء الجلسة أو انتهاك الصلاحيات
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا ارجع السيرفر 401 (غير موثق/التوكن منتهي) أو 403 (غير مصرح بالدخول)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // إزالة التوكن والـ role المعطوبة/المنتهية
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // التوجيه لصفحة تسجيل الدخول إذا لم يكن المستخدم فيها بالفعل
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;