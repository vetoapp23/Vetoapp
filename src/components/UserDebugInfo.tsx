import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const UserDebugInfo: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshProfile, logout } = useAuth();

  const handleRefresh = async () => {
    try {
      // Force clear all caches
      localStorage.clear();
      sessionStorage.clear();
      
      // Invalidate Supabase auth cache
      await supabase.auth.refreshSession();
      
      // Refresh profile
      await refreshProfile();
      
      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const handleForceRelogin = async () => {
    try {
      await logout();
      // Clear everything
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to login
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return <div className="bg-yellow-100 p-4 rounded">Loading user data...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="bg-red-100 p-4 rounded">User not authenticated</div>;
  }

  return (
    <div className="bg-blue-100 p-4 rounded mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug User Info:</h3>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} size="sm" variant="outline">
            Refresh Profile
          </Button>
          <Button onClick={handleForceRelogin} size="sm" variant="destructive">
            Force Re-login
          </Button>
        </div>
      </div>
      <pre className="text-xs overflow-auto bg-white p-2 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
      <div className="mt-2">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.profile?.role || 'undefined'}</p>
        <p><strong>Status:</strong> {user.profile?.status || 'undefined'}</p>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default UserDebugInfo;