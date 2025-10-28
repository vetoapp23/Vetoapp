import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Prevent infinite loading with timeout
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('⏱️ ProtectedRoute: Loading timeout');
        setLoadingTimeout(true);
      }, 2000); // 2 second timeout (reduced from 3s)

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // If loading for too long, assume not authenticated
  if (loadingTimeout) {
    console.log('❌ ProtectedRoute: Timeout reached, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Show loading spinner only briefly and not indefinitely
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // In multi-tenant system, users are auto-approved:
  // - Veterinarians are approved when they create organization
  // - Assistants are approved when they accept invitation
  // Only redirect rejected users (if any)
  if (user?.profile?.status === 'rejected') {
    console.log('❌ ProtectedRoute: User rejected, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
}
