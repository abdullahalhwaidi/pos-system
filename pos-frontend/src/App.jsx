import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cashier from './pages/Cashier';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <main>
        <Routes>
          {/* صفحة تسجيل الدخول العامة */}
          <Route path="/login" element={<Login />} />

          {/* صفحة الكاشير: مسموحة للكاشير والمدير والأدمن */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
                <Cashier />
              </ProtectedRoute>
            }
          />

          {/* صفحة المخزن: مسموحة للمدير والأدمن */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;