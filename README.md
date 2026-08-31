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



<img width="1920" height="1080" alt="login_screen" src="https://github.com/user-attachments/assets/248ed87f-3848-47e9-98e6-6dd54ab5ef25" />
<img width="1920" height="1080" alt="cashier_screen" src="https://github.com/user-attachments/assets/44cf61a4-a61c-4ba3-9cbb-02b5c8d858a6" />
<img width="1920" height="1080" alt="inventory_screen" src="https://github.com/user-attachments/assets/d5315df1-9d67-42bd-adbc-440b69735d3f" />

## 🔄 مخطط تدفق العمليات (Process Flow)
```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Vite)"]
        UI["React UI (Cashier & Inventory)"]
        Axios["Axios Instance (Interceptors & Auth Header)"]
        Guard["ProtectedRoute Component"]
        UI --> Guard
        Guard --> Axios
    end

    subgraph Security ["Authentication & Security Guard"]
        JWT["JWT Auth Middleware (auth.js)"]
    end

    subgraph Backend ["Backend (Node.js & Express)"]
        Router["Express Router (/api)"]
        
        subgraph Routes ["Routes Layer"]
            AuthRoute["authRoutes.js"]
            ProdRoute["productRoutes.js"]
            SaleRoute["saleRoutes.js"]
            CatRoute["categoryRoutes.js"]
        end
        
        subgraph Controllers ["Controllers Layer"]
            AuthCtrl["authController.js"]
            ProdCtrl["productController.js"]
            SaleCtrl["saleController.js"]
            CatCtrl["categoryController.js"]
        end

        Router --> AuthRoute
        Router --> ProdRoute
        Router --> SaleRoute
        Router --> CatRoute

        AuthRoute --> AuthCtrl
        ProdRoute -->|Protected via JWT| JWT
        SaleRoute -->|Protected via JWT| JWT
        CatRoute -->|Protected via JWT| JWT

        JWT --> ProdCtrl
        JWT --> SaleCtrl
        JWT --> CatCtrl
    end

    subgraph Database ["Database Layer (ORM)"]
        PrismaClient["Prisma Client Config"]
        SQLite["SQLite Database (dev.db)"]
        
        Controllers --> PrismaClient
        PrismaClient --> SQLite
    end

    Axios -->|HTTP Requests / REST API| Router
```
