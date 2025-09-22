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

  // Prevent infinite loading with timeout
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 2000); // 2 second timeout for login pages

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // If loading for too long, show login form
  if (loadingTimeout) {
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

  // If user is authenticated, redirect immediately
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
