# 🛒 React POS System (Point of Sale)

## 📌 Product Requirement Document (PRD)

### 🎯 Project Overview
A fast, modular Point of Sale (POS) web application designed for cashier speed and efficient inventory tracking. Built to handle real-time shopping cart calculations, scanner input, and inventory alerts without page reloads.

---

### 🚀 Key Features
* **Cashier Interface:**
  * Barcode scanner support (auto-submits on Enter key).
  * Real-time item additions, quantity updates, and deletions.
  * Instant subtotal, discount, final amount, and change due calculations.
  * Direct invoice submission to the backend database.
* **Inventory Management:**
  * Dedicated route for stock control and product entry.
  * Real-time inventory table with status indicators.
  * Automated visual alert (highlighting) for out-of-stock items ($0$).
* **Architecture & Navigation:**
  * Seamless client-side routing via `react-router-dom`.
  * Clean component separation between Checkout (`Cashier.jsx`) and Stock (`Inventory.jsx`).

---

### 🛠️ Tech Stack
* **Frontend:** React.js, React Router DOM, Vite, CSS3.
* **Backend:** Node.js, Express.js.
* **Database:** SQLite (`store.db`).

---

## 💻 Getting Started

### 1. Clone the Repository
git clone [https://github.com/abdullahalhwaidi/pos-system.git](https://github.com/abdullahalhwaidi/pos-system.git)
cd pos-system


## 🔄 مخطط تدفق العمليات (Process Flow)

```mermaid
graph TD
    Start([بدء شاشة المخزون]) --> LoadData[تحميل قائمة المنتجات والإحصائيات]
    
    LoadData --> UserAction{اختيار الإجراء}

    %% 1. مسار إضافة منتج جديد
    UserAction -- إضافة منتج --> InputForm[إدخال بيانات المنتج: الاسم، السعر، الكمية]
    InputForm --> CheckValid{هل الاسم والسعر مدخلان؟}
    CheckValid -- لا --> ShowError[توقف / انتظار التعبئة]
    CheckValid -- نعم --> AddProduct[إضافة المنتج للقائمة وزيادة العداد]
    AddProduct --> UpdateUI[تحديث واجهة المستخدم والإحصائيات]

    %% 2. مسار تعديل الكمية (+ / -)
    UserAction -- تعديل الكمية --> ChangeStock[الضغط على زر + أو -]
    ChangeStock --> CalcStock{هل الكمية الجديدة أقل من 0؟}
    CalcStock -- نعم --> KeepZero[تثبيت الكمية عند 0]
    CalcStock -- لا --> ApplyStock[تحديث قيمة المخزون]
    KeepZero --> CheckStatus[تحديث شارة الحالة: متوفر / منخفض / نافد]
    ApplyStock --> CheckStatus
    CheckStatus --> UpdateUI

    %% 3. مسار حذف منتج
    UserAction -- حذف منتج --> ConfirmDelete{تأكيد الحذف عبر الرسالة؟}
    ConfirmDelete -- لا --> CancelDelete[إلغاء العملية]
    ConfirmDelete -- نعم --> RemoveItem[تصفية المنتج من القائمة]
    RemoveItem --> UpdateUI
```