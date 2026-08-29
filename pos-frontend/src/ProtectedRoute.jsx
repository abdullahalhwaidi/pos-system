import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // طباعة القيم في Console لمتابعة الحالة
  console.log("Current Token:", !!token);
  console.log("Current Role in LocalStorage:", userRole);
  console.log("Allowed Roles for this route:", allowedRoles);

  // 1. إذا لم يكن هناك توكن، قم بالتحويل لصفحة Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كانت هناك أدوار محددة ولا يملك المستخدم هذا الدور
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn("Access Denied: Redirecting to /");
    return <Navigate to="/" replace />;
  }

  // 3. السماح بالمرور للمحتوى
  return children;
};

export default ProtectedRoute;