import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirect({ children, redirectTo = '/dashboard' }: AuthRedirectProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug log auth state changes
  useEffect(() => {
    console.log('🔍 AuthRedirect state:', { isAuthenticated, isLoading, hasUser: !!user });
  }, [isAuthenticated, isLoading, user]);

  // Prevent infinite loading with timeout
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('⏱️ Loading timeout reached');
        setLoadingTimeout(true);
      }, 3000); // 3 second timeout (increased from 2s for slower connections)

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // If user is authenticated, redirect immediately (check this FIRST)
  if (isAuthenticated && user) {
    console.log('✅ User authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If loading for too long, show login form
  if (loadingTimeout) {
    console.log('⏱️ Loading timeout, showing login form');
    return <>{children}</>;
  }

  // Show minimal loading state only briefly
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-xs text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show login form
  return <>{children}</>;
}
