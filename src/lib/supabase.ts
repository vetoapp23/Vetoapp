import { createClient } from '@supabase/supabase-js'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for regular user operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database Types
export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string | null
  role: 'admin' | 'assistant'
  created_at: string
  updated_at: string
  avatar_url: string | null
  // Personal information fields
  phone?: string | null
  address?: string | null
  specialty?: string | null
  experience?: string | null
  bio?: string | null
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string, username: string, fullName: string, role: 'admin' | 'assistant' = 'assistant') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role
      }
    }
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('No authenticated user')

  // First check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, create it first
  if (!existingProfile) {
    await createUserProfileIfNotExists(user)
  }

  // Prepare update data, excluding undefined values
  const updateData = Object.entries({
    ...updates,
    updated_at: new Date().toISOString()
  }).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as any)

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    // Try upsert as fallback
    const upsertData = {
      id: user.id,
      email: user.email!,
      username: existingProfile?.username || user.email!.split('@')[0],
      full_name: existingProfile?.full_name || '',
      role: (existingProfile?.role as 'admin' | 'assistant') || 'assistant',
      ...updateData
    }

    const { data: upsertResult, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(upsertData)
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Profile update failed: ${upsertError.message}`)
    }

    return upsertResult
  }

  return data
}

// Admin functions (require service role key for RLS bypass)
export const createUserProfileIfNotExists = async (user: SupabaseUser): Promise<UserProfile> => {
  try {
    // First try to get existing profile
    const existingProfile = await getCurrentUserProfile();
    if (existingProfile) {
      return existingProfile;
    }

    // If no profile exists, create one
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || user.email!.split('@')[0],
        full_name: user.user_metadata?.full_name || '',
        role: user.user_metadata?.role || 'assistant'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })

  if (error) throw error
  return data
}