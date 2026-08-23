const express = require('express');
const cors = require('cors');
const db = require('./database/connection');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// REST API ENDPOINTS - المنتجات
// ==========================================

// 1. إضافة منتج جديد
app.post('/api/products', (req, res) => {
    const { barcode, name, price, stock_quantity } = req.body;

    if (!barcode || !name || price === undefined) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة (barcode, name, price)' });
    }

    const initialStock = stock_quantity !== undefined ? stock_quantity : 0;
    const sql = `INSERT INTO products (barcode, name, price, stock_quantity) VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [barcode, name, price, initialStock], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'الباركود مسجل مسبقاً في النظام' });
            }
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'تمت إضافة السلعة بنجاح',
            data: {
                id: this.lastID,
                barcode,
                name,
                price,
                stock_quantity: initialStock
            }
        });
    });
});

// 2. جلب جميع المنتجات
app.get('/api/products', (req, res) => {
    const sql = `SELECT * FROM products ORDER BY id DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            count: rows.length,
            products: rows
        });
    });
});

// 3. البحث عن منتج عن طريق الباركود
app.get('/api/products/:barcode', (req, res) => {
    const { barcode } = req.params;
    const sql = `SELECT * FROM products WHERE barcode = ?`;

    db.get(sql, [barcode], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'لم يتم العثور على المنتج' });
        res.json(row);
    });
});

// 4. تعديل بيانات منتج عن طريق الـ ID
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, stock_quantity } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'الاسم والسعر مطلوبان للتعديل' });
    }

    const sql = `UPDATE products SET name = ?, price = ?, stock_quantity = COALESCE(?, stock_quantity) WHERE id = ?`;
    
    db.run(sql, [name, price, stock_quantity, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم تعديل المنتج بنجاح' });
    });
});

// 5. حذف منتج عن طريق الـ ID
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM products WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
        res.json({ message: 'تم حذف المنتج بنجاح' });
    });
});

// ==========================================
// REST API ENDPOINTS - الفواتير
// ==========================================

// 6. حفظ فاتورة جديدة (مع الخصم وخصم المخزون وحساب الإجمالي الآمن)
app.post('/api/invoices', (req, res) => {
    const { items, discount = 0, paid_amount, payment_method = 'cash' } = req.body; 

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'بيانات الفاتورة غير مكتملة' });
    }

    const barcodes = items.map(i => i.barcode);
    const placeholders = barcodes.map(() => '?').join(',');
    const getProductsSql = `SELECT * FROM products WHERE barcode IN (${placeholders})`;

    // جلب المنتجات من الداتا بيز للتحقق من الأسعار والمخزون
    db.all(getProductsSql, barcodes, (err, dbProducts) => {
        if (err) return res.status(500).json({ error: err.message });

        const dbProductsMap = new Map(dbProducts.map(p => [p.barcode, p]));
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = dbProductsMap.get(item.barcode);
            if (!product) {
                return res.status(404).json({ error: `المنتج بالباركود (${item.barcode}) غير موجود` });
            }
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `الكمية المتاحة للمنتج (${product.name}) غير كافية. المتاح: ${product.stock_quantity}` 
                });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            processedItems.push({
                barcode: product.barcode,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: subtotal
            });
        }

        const finalAmount = Math.max(0, totalAmount - discount);
        const actualPaid = paid_amount !== undefined ? paid_amount : finalAmount;

        if (actualPaid < finalAmount) {
            return res.status(400).json({ error: 'المبلغ المدفوع أقل من المبلغ الإجمالي النهائي' });
        }

        const changeAmount = actualPaid - finalAmount;

        // تنفيذ المعاملة الحافظة للفاتورة وخصم المخزون
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const insertInvoiceSql = `
                INSERT INTO invoices (total_amount, discount, final_amount, paid_amount, change_amount, payment_method)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(insertInvoiceSql, [totalAmount, discount, finalAmount, actualPaid, changeAmount, payment_method], function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                const invoiceId = this.lastID;
                const insertItemSql = `
                    INSERT INTO invoice_items (invoice_id, barcode, product_name, price, quantity, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                const updateStockSql = `UPDATE products SET stock_quantity = stock_quantity - ? WHERE barcode = ?`;

                let hasError = false;

                for (const item of processedItems) {
                    db.run(insertItemSql, [invoiceId, item.barcode, item.name, item.price, item.quantity, item.subtotal], (err) => {
                        if (err) hasError = true;
                    });

                    db.run(updateStockSql, [item.quantity, item.barcode], (err) => {
                        if (err) hasError = true;
                    });
                }

                if (hasError) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: 'حدث خطأ أثناء تسجيل مواد الفاتورة وتحديث المخزون' });
                }

                db.run("COMMIT");

                res.status(201).json({
                    message: 'تم حفظ الفاتورة بنجاح',
                    invoice: {
                        invoice_id: invoiceId,
                        total_amount: totalAmount,
                        discount,
                        final_amount: finalAmount,
                        paid_amount: actualPaid,
                        change_amount: changeAmount,
                        payment_method,
                        items: processedItems
                    }
                });
            });
        });
    });
});

// 7. جلب جميع الفواتير
app.get('/api/invoices', (req, res) => {
    const sql = `SELECT * FROM invoices ORDER BY id DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            count: rows.length,
            invoices: rows
        });
    });
});

// 8. جلب تفاصيل فاتورة محددة مع جميع عناصرها
app.get('/api/invoices/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            invoices.id AS invoice_id,
            invoices.total_amount,
            invoices.discount,
            invoices.final_amount,
            invoices.paid_amount,
            invoices.change_amount,
            invoices.payment_method,
            invoices.created_at,
            invoice_items.id AS item_id,
            invoice_items.barcode,
            invoice_items.product_name,
            invoice_items.price,
            invoice_items.quantity,
            invoice_items.subtotal
        FROM invoices
        JOIN invoice_items ON invoices.id = invoice_items.invoice_id
        WHERE invoices.id = ?
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'الفاتورة غير موجودة' });

        const invoiceData = {
            invoice_id: rows[0].invoice_id,
            total_amount: rows[0].total_amount,
            discount: rows[0].discount,
            final_amount: rows[0].final_amount,
            paid_amount: rows[0].paid_amount,
            change_amount: rows[0].change_amount,
            payment_method: rows[0].payment_method,
            created_at: rows[0].created_at,
            items: rows.map(row => ({
                item_id: row.item_id,
                barcode: row.barcode,
                product_name: row.product_name,
                price: row.price,
                quantity: row.quantity,
                subtotal: row.subtotal
            }))
        };

        res.json(invoiceData);
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل حالياً على: http://localhost:${PORT}`);
});