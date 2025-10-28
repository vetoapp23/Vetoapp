import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // IMPORTANT: Check authentication status FIRST
  // If we have a user, render immediately (even if isLoading is true due to background refetch)
  if (isAuthenticated && user) {
    // Check user status
    if (user?.profile?.status === 'rejected') {
      console.log('❌ ProtectedRoute: User rejected, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
    return <>{children}</>;
  }

  // Show loading spinner only if we're checking auth state
  if (isLoading) {
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

  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
}
