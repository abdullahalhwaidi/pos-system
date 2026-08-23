const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// تحديد مسار ملف قاعدة البيانات داخل جذر المشروع
const dbPath = path.resolve(__dirname, '../store.db');

// 1. الاتصال بقاعدة البيانات (إن لم يكن الملف موجوداً سيتم إنشاؤه تلقائياً)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة البيانات المحلية SQLite بنجاح.');
    }
});

// 2. إعداد الجداول عند التشغيل
db.serialize(() => {

    db.run('PRAGMA foreign_keys = ON;', (err) => {
        if(err) console.error('❌ خطأ في تفعيل المفاتيح الأجنبية:', err.message);
    })    
    // 1️⃣ جدول المنتجات
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ خطأ في إنشاء جدول المنتجات:', err.message);
        } else {
            console.log('📦 جدول المنتجات جاهز للعمل.');
        }
    });

    // 2️⃣ جدول الفواتير الرئيسي
    db.run(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_amount REAL NOT NULL,
            discount REAL DEFAULT 0,
            final_amount REAL NOT NULL,
            paid_amount REAL NOT NULL,
            change_amount REAL DEFAULT 0,
            payment_method TEXT DEFAULT 'cash',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ خطأ في إنشاء جدول الفواتير:', err.message);
        } else {
            console.log('🧾 جدول الفواتير جاهز للعمل.');
        }
    });

    // 3️⃣ جدول عناصر/مواد الفاتورة
    db.run(`
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            barcode TEXT NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ خطأ في إنشاء جدول عناصر الفاتورة:', err.message);
        } else {
            console.log('🛒 جدول عناصر الفواتير جاهز للعمل.');
        }
    });
});

module.exports = db;