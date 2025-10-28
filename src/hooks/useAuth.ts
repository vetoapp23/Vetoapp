import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, UserProfile, signIn, signOut, getCurrentUserProfile, createUserProfileIfNotExists, signInWithGoogle, resetPassword } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  profile: UserProfile
  organization_id?: string | null
}

// Auth query keys - simplified and consistent
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

// Centralized auth session fetcher
const fetchAuthSession = async (): Promise<User | null> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return null
    }

    // Get or create user profile with better error handling
    let profile: UserProfile | null = null
    
    try {
      profile = await getCurrentUserProfile()
      console.log('✅ Profile loaded from database:', profile);
    } catch (profileError) {
      console.error('❌ Error loading profile:', profileError);
      // Try to create profile if it doesn't exist
      try {
        profile = await createUserProfileIfNotExists(session.user)
        console.log('✅ Profile created:', profile);
      } catch (createError) {
        console.error('❌ Failed to create user profile:', createError);
        // CRITICAL: Don't use fallback - throw error instead
        // This fallback was causing the admin role to be overridden with 'assistant'
        throw new Error('Failed to load or create user profile. Please contact support.');
      }
    }

    if (!profile) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      profile,
      organization_id: profile.organization_id
    }
  } catch (error) {
    return null
  }
}

// Optimized auth session hook with better caching strategy
export const useAuthSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchAuthSession,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: 1, // One retry on failure
    refetchOnWindowFocus: false, // Prevent focus refetches
    refetchOnMount: true, // Need to refetch on mount to update after login
    refetchOnReconnect: false, // Prevent reconnect refetches
    networkMode: 'offlineFirst', // Better offline handling
  })
}

// Login mutation with improved error handling and caching
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔑 Starting login process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Login error:', error);
        // Map common Supabase auth errors to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          'Invalid login credentials': 'Email ou mot de passe incorrect',
          'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
          'Too many requests': 'Trop de tentatives de connexion. Veuillez réessayer plus tard'
        }
        
        const userMessage = errorMessages[error.message] || error.message
        throw new Error(userMessage)
      }

      if (!data.user || !data.session) {
        throw new Error('Échec de connexion - session invalide')
      }

      console.log('✅ Auth successful, fetching user profile...');
      
      // Fetch user profile immediately after login
      const profile = await fetchAuthSession()
      
      console.log('✅ User profile fetched:', profile);
      
      return { user: data.user, profile }
    },
    onSuccess: async (data) => {
      console.log('✅ Login mutation success, setting query data...');
      // Set the auth session data immediately
      queryClient.setQueryData(authKeys.session(), data.profile)
      console.log('✅ Query data set, user should be authenticated now');
    },
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
      // Clear any stale auth data on login error
      queryClient.setQueryData(authKeys.session(), null)
    }
  })
}

// Logout mutation with better cleanup
export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      // Clear auth data immediately
      queryClient.setQueryData(authKeys.session(), null)
      // Remove from cache entirely
      queryClient.removeQueries({ queryKey: authKeys.session() })
    }
  })
}

// Refresh profile mutation
export const useRefreshProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const profile = await getCurrentUserProfile()
      if (!profile) {
        throw new Error('Could not refresh profile')
      }
      return profile
    },
    onSuccess: () => {
      // Invalidate session to refetch with new profile
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
    }
  })
}

// Google login mutation
export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL}/dashboard`
        }
      })

      if (error) {
        throw error
      }

      return data
    }
  })
}

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await resetPassword(email)
    }
  })
}
