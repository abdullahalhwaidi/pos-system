import { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

function Cashier() {
  const [cart, setCart] = useState([]);
  const [scanBarcode, setScanBarcode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  // إضافة منتج لسلة المبيعات عبر الباركود
  const addToCartByBarcode = async (barcodeToScan) => {
    if (!barcodeToScan) return;

    try {
      const res = await fetch(`${API_URL}/products/${barcodeToScan}`);
      if (!res.ok) {
        alert('المنتج غير موجود!');
        return;
      }
      const product = await res.json();

      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.barcode === product.barcode);
        if (existing) {
          if (existing.quantity + 1 > product.stock_quantity) {
            alert('الكمية المطلوبة تتجاوز المتاح في المخزن!');
            return prevCart;
          }
          return prevCart.map((item) =>
            item.barcode === product.barcode ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          if (product.stock_quantity < 1) {
            alert('المنتج نفد من المخزن!');
            return prevCart;
          }
          return [...prevCart, { ...product, quantity: 1 }];
        }
      });

      setScanBarcode('');
    } catch (err) {
      alert('حدث خطأ أثناء البحث عن المنتج');
    }
  };

  // تعديل الكميات
  const updateCartQty = (barcode, qty) => {
    const newQty = parseInt(qty);
    if (isNaN(newQty) || newQty < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) => (item.barcode === barcode ? { ...item, quantity: newQty } : item))
    );
  };

  // حذف عنصر من السلة
  const removeFromCart = (barcode) => {
    setCart((prevCart) => prevCart.filter((item) => item.barcode !== barcode));
  };

  // الحسابات المالية
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = Math.max(0, subtotal - (parseFloat(discount) || 0));
  const changeAmount = (parseFloat(paidAmount) || 0) > finalAmount ? (parseFloat(paidAmount) || 0) - finalAmount : 0;

  // حفظ الفاتورة بالباك إند
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    const invoicePayload = {
      items: cart.map((i) => ({ barcode: i.barcode, quantity: i.quantity })),
      discount: parseFloat(discount) || 0,
      paid_amount: parseFloat(paidAmount) || 0,
      payment_method: 'cash'
    };

    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      const data = await res.json();

      if (res.ok) {
        alert(`تم حفظ الفاتورة بنجاح! رقم الفاتورة: ${data.invoice.invoice_id}`);
        setCart([]);
        setDiscount(0);
        setPaidAmount(0);
      } else {
        alert(`خطأ: ${data.error}`);
      }
    } catch (err) {
      alert('خطأ أثناء حفظ الفاتورة');
    }
  };

  return (
    <div className="container" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
      <section className="card">
        <h2>شاشة الكاشير (المبيعات)</h2>
        <div className="checkout-search">
          <input
            type="text"
            placeholder="امسح أو اكتب الباركود..."
            value={scanBarcode}
            onChange={(e) => setScanBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addToCartByBarcode(scanBarcode)}
            autoFocus
          />
          
        </div>

        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>السعر</th>
              <th>الكمية</th>
              <th>الإجمالي</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.barcode}>
                <td>{item.name}</td>
                <td>{item.price} $</td>
                <td>
                  <input
                    type="number"
                    style={{ width: '60px' }}
                    value={item.quantity}
                    onChange={(e) => updateCartQty(item.barcode, e.target.value)}
                  />
                </td>
                <td>{(item.price * item.quantity).toFixed(2)} $</td>
                <td>
                  <button className="btn" style={{ background: '#e74c3c' }} onClick={() => removeFromCart(item.barcode)}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary-section">
          <p>الإجمالي قبل الخصم: {subtotal.toFixed(2)} $</p>
          <div className="field">
            <label>الخصم ($): </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <h3>المبلغ النهائي: {finalAmount.toFixed(2)} $</h3>
          <div className="field">
            <label>المبلغ المدفوع ($): </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>
          <h3>الباقي للعميل: {changeAmount.toFixed(2)} $</h3>

          <button className="btn btn-success" onClick={handleCheckout}>
            إتمام عملية البيع
          </button>
        </div>
      </section>
    </div>
  );
}

export default Cashier;