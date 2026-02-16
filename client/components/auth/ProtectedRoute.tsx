import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-lg opacity-60"></div>
            <div className="relative bg-gradient-to-r from-primary to-primary/80 p-6 rounded-2xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Verifying authentication...
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Please wait while we check your credentials
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
