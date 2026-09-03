import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', barcode: '', price: '', stock: '', category: '' });

  const userRole = localStorage.getItem('role') || 'cashier';

  // 1️⃣ Fetch products from backend with safe structure parsing
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      
      const rawData = response.data;
      const dataArray = Array.isArray(rawData)
        ? rawData
        : rawData?.products || rawData?.data || [];

      setProducts(dataArray);
    } catch (error) {
      console.error('Error fetching inventory products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2️⃣ Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  // 3️⃣ Add new product handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      const productPayload = {
        name: formData.name,
        barcode: formData.barcode,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category: formData.category
      };

      const response = await api.post('/products', productPayload);
      alert(response.data?.message || 'Product added successfully!');
      
      fetchProducts();
      setFormData({ name: '', barcode: '', price: '', stock: '', category: '' });
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.message || 'Failed to add product');
    }
  };

  // 4️⃣ Delete product handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await api.delete(`/products/${id}`);
      alert(response.data?.message || 'Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // 5️⃣ Quick stock update handler
  const handleUpdateStock = async (id, currentStock, amount) => {
    const newStock = Math.max(0, currentStock + amount);

    try {
      await api.put(`/products/${id}`, { stock: newStock });
      setProducts(prev => 
        (Array.isArray(prev) ? prev : []).map(item => 
          item.id === id ? { ...item, stock: newStock } : item
        )
      );
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock quantity on server');
    }
  };

  const safeProductsList = Array.isArray(products) ? products : [];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              POS
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">POS System</h1>
              <span className="text-xs text-blue-400 font-medium">Inventory Management</span>
            </div>
          </div>
          
          <nav className="mt-6 space-y-2">
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
              <span>🛒</span> Register
            </Link>
            <Link to="/inventory" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all shadow-md shadow-blue-600/20">
              <span>📦</span> Inventory
            </Link>
          </nav>
        </div>

        {/* User Role Card + Logout */}
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-sm font-semibold text-white capitalize">
                {userRole === 'manager' || userRole === 'admin' ? 'Manager' : 'Cashier'}
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-1 h-screen overflow-y-auto p-8 flex flex-col gap-8">
        
        {/* Header & Quick Stats */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products & Inventory</h1>
            <p className="text-sm text-slate-500">Add, edit, and track product quantities in stock</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm text-left">
              <span className="text-xs text-slate-500 font-medium block">Total Products</span>
              <span className="text-xl font-bold text-slate-900">{safeProductsList.length} products</span>
            </div>
            <div className="bg-red-50 border border-red-100 px-5 py-3 rounded-2xl shadow-sm text-left">
              <span className="text-xs text-red-600 font-medium block">Out of Stock</span>
              <span className="text-xl font-bold text-red-700">
                {safeProductsList.filter(p => p.stock === 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>✨</span> Add New Product
          </h2>

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm outline-none"
              required
            />
            <input
              type="text"
              placeholder="Barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm outline-none"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (JOD)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm outline-none"
              required
            />
            <input
              type="number"
              placeholder="Stock Qty"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm outline-none"
            />
            <button
              type="submit"
              className="py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>➕</span> Save Product
            </button>
          </form>
        </div>

        {/* Inventory Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Current Inventory List</h2>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            {loading ? (
              <p className="p-6 text-center text-slate-500">Loading inventory data...</p>
            ) : safeProductsList.length === 0 ? (
              <p className="p-6 text-center text-slate-400">No products registered yet. Add your first item using the form above.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Barcode</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-center">Adjust Qty</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeProductsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-4 text-slate-500 font-mono">{item.barcode || '—'}</td>
                      <td className="p-4 font-bold text-slate-900">{Number(item.price).toFixed(2)} JOD</td>
                      <td className="p-4">
                        {item.stock === 0 ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">Out of Stock</span>
                        ) : item.stock < 5 ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">Low ({item.stock})</span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">In Stock ({item.stock})</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleUpdateStock(item.id, item.stock, -1)} 
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold transition-all"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => handleUpdateStock(item.id, item.stock, 1)} 
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDeleteProduct(item.id)}
                          className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}