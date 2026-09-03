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
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Cashier Route: Accessible by cashier, manager, and admin */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
                <Cashier />
              </ProtectedRoute>
            }
          />

          {/* Inventory Route: Accessible by manager and admin only */}
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