import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Cashier() {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const barcodeInputRef = useRef(null);

  // قراءة بيانات المستخدم الحالية من localStorage
  const userRole = localStorage.getItem('role') || 'cashier';

  // 1️⃣ جلب المنتجات من الباك إند مع معالجة آمنة للهيكل
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      
      // استخراج المصفوفة بأمان سواء كانت مباشرة أو داخل Object
      const rawData = response.data;
      const dataArray = Array.isArray(rawData)
        ? rawData
        : rawData?.products || rawData?.data || [];

      setAvailableProducts(dataArray);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      setAvailableProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2️⃣ إبقاء المؤشر متمركزاً دائماً على خانة الباركود
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [cart]);

  // 3️⃣ دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  // 4️⃣ دالة إدخال المنتجات عبر الباركود
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;

    const productsList = Array.isArray(availableProducts) ? availableProducts : [];

    // البحث بالمطابقة المرنة للباركود (تحويل الطرفين إلى String ومسح المسافات)
    const foundProduct = productsList.find(
      (p) => String(p.barcode || '').trim() === cleanBarcode
    );

    if (foundProduct) {
      // التحقق من توفر كمية بالمخزون
      if (foundProduct.stock !== undefined && foundProduct.stock <= 0) {
        alert('هذا المنتج نفد من المخزون!');
        setBarcode('');
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === foundProduct.id);
        if (existingItem) {
          // التحقق من عدم تجاوز مخزون المنتج عند الزيادة
          if (foundProduct.stock && existingItem.qty >= foundProduct.stock) {
            alert('وصلت للحد الأقصى للمخزون المتاح لهذا المنتج');
            return prevCart;
          }
          return prevCart.map((item) =>
            item.id === foundProduct.id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [...prevCart, { ...foundProduct, qty: 1 }];
      });
      setBarcode(''); // تفريغ الخانة فوراً لاستقبال الباركود التالي
    } else {
      alert(`المنتج بالباركود (${cleanBarcode}) غير موجود في قاعدة البيانات!`);
      setBarcode('');
    }
  };

  // 5️⃣ دالة تعديل الكمية
  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            // التحقق من عدم تجاوز الكمية المتاحة بالمخزون
            if (delta > 0 && item.stock && newQty > item.stock) {
              alert('لا توجد كمية إضافية في المخزون');
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // 6️⃣ دالة حذف عنصر
  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 7️⃣ الحسابات المالية
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * item.qty, 0);
  const tax = subtotal * 0.16; // ضريبة 16%
  const total = subtotal + tax;

  const safeProductsCount = Array.isArray(availableProducts) ? availableProducts.length : 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans dir-rtl">
      
      {/* 1. القائمة الجانبية */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              POS
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">نظام الكاشير</h1>
              <span className="text-xs text-blue-400 font-medium">الإصدار الاحترافي</span>
            </div>
          </div>
          
          <nav className="mt-6 space-y-2">
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all shadow-md shadow-blue-600/20">
              <span>🛒</span> شاشة البيع
            </Link>

            <Link to="/inventory" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
              <span>📦</span> إدارة المخزون
            </Link>
          </nav>
        </div>

        {/* كارت بيانات المستخدم + زر الخروج */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">الصلاحية</p>
              <p className="text-sm font-semibold text-white capitalize">{userRole === 'manager' || userRole === 'admin' ? 'مدير النظام' : 'كاشير'}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* 2. منطقة العمل الرئيسية */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* شريط الإدخال والباركود */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
          <form onSubmit={handleBarcodeSubmit} className="relative w-96">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder={loading ? "جاري تحميل المنتجات..." : "امسح الباركود واضغط Enter..."}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm"
              autoFocus
            />
            <span className="absolute right-3 top-3 text-slate-400">🔍</span>
          </form>

          <div className="flex gap-4">
            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-right">
              <span className="text-xs text-blue-600 font-semibold block">إجمالي المنتجات المتاحة</span>
              <span className="text-lg font-bold text-blue-900">{safeProductsCount} منتج</span>
            </div>
          </div>
        </header>

        {/* عرض السلة وملخص الفاتورة */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          
          {/* جدول السلة */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-700">قائمة السلة الحالية</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {cart.length} عناصر
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-5xl mb-2">🛍️</span>
                  <p>السلة فارغة، قم بمسح باركود لبدء البيع</p>
                </div>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead className="border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="pb-3">المنتج</th>
                      <th className="pb-3">السعر</th>
                      <th className="pb-3 text-center">الكمية</th>
                      <th className="pb-3">الإجمالي</th>
                      <th className="pb-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-3 text-slate-600">{Number(item.price).toFixed(2)} د.أ</td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold">-</button>
                            <span className="font-bold w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold">+</button>
                          </div>
                        </td>
                        <td className="py-3 font-bold text-blue-600">{(item.price * item.qty).toFixed(2)} د.أ</td>
                        <td className="py-3 text-center">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* الفاتورة والدفع */}
          <div className="w-96 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-lg border-b pb-3 mb-4">ملخص الفاتورة</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold text-slate-800">{subtotal.toFixed(2)} د.أ</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>ضريبة المبيعات (16%)</span>
                  <span className="font-semibold text-slate-800">{tax.toFixed(2)} د.أ</span>
                </div>
                <div className="border-t border-dashed pt-3 flex justify-between items-center">
                  <span className="font-bold text-base text-slate-900">الإجمالي النهائي</span>
                  <span className="font-black text-2xl text-blue-600">{total.toFixed(2)} د.أ</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => { 
                  if(cart.length === 0) return alert('السلة فارغة!');
                  alert('تم إتمام عملية الدفع بنجاح!'); 
                  setCart([]); 
                }} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>💳</span> إتمام الدفع والتسديد
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="py-2.5 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-600 font-semibold rounded-xl text-sm transition-all"
                >
                  🖨️ طباعة
                </button>
                <button 
                  onClick={() => setCart([])} 
                  className="py-2.5 border border-red-200 hover:bg-red-50 text-red-600 active:scale-[0.98] font-semibold rounded-xl text-sm transition-all"
                >
                  🗑️ إلغاء
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}