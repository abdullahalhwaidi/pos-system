import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If specific roles are required and the user does not possess the required role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their default main page
    return <Navigate to="/" replace />;
  }

  // 3. Allow access to protected content
  return children;
};

export default ProtectedRoute;