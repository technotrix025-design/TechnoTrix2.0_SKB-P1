import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null; // AuthProvider handles the loading screen
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
