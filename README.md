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

<img width="1520" height="855" alt="login_screen" src="https://github.com/user-attachments/assets/c97787d2-b248-4b23-8416-7103361f56f7" />
<img width="1920" height="900" alt="inventory_screen" src="https://github.com/user-attachments/assets/76af0a96-4417-4375-8254-ec548dfa3f98" />
<img width="1920" height="883" alt="Screenshot (15)" src="https://github.com/user-attachments/assets/7331d30d-416c-41dd-9454-f164c2292e16" />


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
