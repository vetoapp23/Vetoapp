import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, UserProfile, signIn, signOut, getCurrentUserProfile, createUserProfileIfNotExists } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  profile: UserProfile
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
    } catch (profileError) {
      // Try to create profile if it doesn't exist
      try {
        profile = await createUserProfileIfNotExists(session.user)
      } catch (createError) {
        // Use fallback profile as last resort
        profile = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
          full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: session.user.user_metadata?.avatar_url || null
        }
      }
    }

    if (!profile) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      profile
    }
  } catch (error) {
    console.error('Auth session fetch error:', error)
    return null
  }
}

// Optimized auth session hook with better caching strategy
export const useAuthSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchAuthSession,
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter for better responsiveness
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: false, // No retries to prevent loops
    refetchOnWindowFocus: false, // Prevent focus refetches
    refetchOnMount: 'always', // Always refetch on mount for consistency
    refetchOnReconnect: false, // Prevent reconnect refetches
    networkMode: 'offlineFirst', // Better offline handling
  })
}

// Login mutation with improved error handling and caching
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
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

        return data.user
      } catch (error) {
        throw error
      }
    },
    onSuccess: async () => {
      // Refetch auth session after successful login with small delay
      await new Promise(resolve => setTimeout(resolve, 100))
      queryClient.refetchQueries({ queryKey: authKeys.session() })
    },
    onError: () => {
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
