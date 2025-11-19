import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role?.name !== 'admin') {
    return <Navigate to="/booking" replace />;
  }

  return <>{children}</>;
};
