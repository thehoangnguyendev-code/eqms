import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/app/routes.constants';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageLoading } from '@/components/ui/loading/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <FullPageLoading text="Authenticating..." />;
  }

  // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  // }

  // Check role-based access
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
