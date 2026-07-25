import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export function ProtectedRoute({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: string[] }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />; // Or an unauthorized page
  }

  return <>{children}</>;
}
