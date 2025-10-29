import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirect({ children, redirectTo = '/dashboard' }: AuthRedirectProps) {
  const { isAuthenticated, user } = useAuth();

  // Debug log auth state changes
  useEffect(() => {
    console.log('🔍 AuthRedirect state:', { isAuthenticated, hasUser: !!user });
  }, [isAuthenticated, user]);

  // If user is authenticated, redirect immediately
  if (isAuthenticated && user) {
    console.log('✅ User authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Show login form immediately if not authenticated (no loading state)
  return <>{children}</>;
}
