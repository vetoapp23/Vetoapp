import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'assistant')[];
  fallback?: React.ReactNode;
}

/**
 * Role-based access control component
 * Only renders children if user has one of the allowed roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Admin-only component wrapper
 */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Hook for checking user roles
 */
export const useRoleCheck = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.profile.role === 'admin',
    isAssistant: user?.profile.role === 'assistant',
    hasRole: (role: 'admin' | 'assistant') => user?.profile.role === role,
    hasAnyRole: (roles: ('admin' | 'assistant')[]) =>
      user ? roles.includes(user.profile.role) : false
  };
};
