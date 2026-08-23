import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ barcode: '', name: '', price: '', stock_quantity: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity)
        })
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setNewProduct({ barcode: '', name: '', price: '', stock_quantity: '' });
        fetchProducts();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  return (
    <div className="container">
      {/* نموذج إضافة منتج */}
      <section className="card">
        <h2>إضافة منتج جديد</h2>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="الباركود"
            value={newProduct.barcode}
            onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="اسم المنتج"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="السعر"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="الكمية بالخزينة"
            value={newProduct.stock_quantity}
            onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary">حفظ المنتج</button>
        </form>
      </section>

      {/* جدول عرض المخزون */}
      <section className="card">
        <h2>قائمة المنتجات والمخزون الحالي</h2>
        <table>
          <thead>
            <tr>
              <th>الباركود</th>
              <th>الاسم</th>
              <th>السعر</th>
              <th>المخزون الحالي</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id || p.barcode} style={{ backgroundColor: p.stock_quantity === 0 ? '#ffe6e6' : 'transparent' }}>
                <td>{p.barcode}</td>
                <td>{p.name}</td>
                <td>{p.price} $</td>
                <td style={{ fontWeight: 'bold', color: p.stock_quantity === 0 ? '#c0392b' : 'inherit' }}>
                  {p.stock_quantity === 0 ? 'منتهي (0)' : p.stock_quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Inventory;