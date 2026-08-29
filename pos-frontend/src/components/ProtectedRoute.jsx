import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. إذا لم يكن هناك توكن، قم بالتحويل لصفحة Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كانت هناك أدوار محددة ولا يملك المستخدم هذا الدور
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // إرجاعه للشاشة الرئيسية المسموحة له
    return <Navigate to="/" replace />;
  }

  // 3. السماح بالمرور للمحتوى
  return children;
};

export default ProtectedRoute;