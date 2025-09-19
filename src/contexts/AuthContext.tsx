import React, { createContext, useContext, useEffect, ReactNode, useRef, useState } from 'react';
import { useAuthSession, useLogin, useLogout, useRefreshProfile, User } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: queryLoading, error } = useAuthSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshProfileMutation = useRefreshProfile();
  const queryClient = useQueryClient();
  
  // Track initialization state to prevent infinite loading
  const [isInitialized, setIsInitialized] = useState(false);
  const authStateSetup = useRef(false);

  useEffect(() => {
    if (authStateSetup.current) return;
    authStateSetup.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state changes more precisely
        if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(authKeys.session(), null);
          queryClient.removeQueries({ queryKey: authKeys.session() });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Invalidate on token refresh to get updated data
          queryClient.invalidateQueries({ queryKey: authKeys.session() });
        }
        
        // Mark as initialized after first auth event
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    );

    // Set timeout fallback for initial load
    const initTimeout = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 2000); // 2 second fallback

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
      authStateSetup.current = false;
    };
  }, [queryClient, isInitialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if mutation fails
      queryClient.setQueryData(authKeys.session(), null);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    await refreshProfileMutation.mutateAsync();
  };

  // Compute loading state more intelligently
  const isActuallyLoading = !isInitialized || (queryLoading && !error && user === undefined);
  const mutationLoading = loginMutation.isPending || logoutMutation.isPending;

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user && isInitialized,
    isLoading: isActuallyLoading || mutationLoading,
    login,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
