import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Cashier from './pages/Cashier';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#2c3e50', color: 'white' }}>
        <h1>🛒 نظام نقطة البيع</h1>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🛒 الكاشير</Link>
          <Link to="/inventory" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📦 المخزون</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Cashier />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;