import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/providers/AuthProvider';
import type { UserRole } from '../../shared/types/lela';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles as string[])) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
