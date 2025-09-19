import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAnimals,
  getAnimalsByClient,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  searchClients,
  searchAnimals,
  getClientStats,
  type Client,
  type Animal,
  type CreateClientData,
  type CreateAnimalData
} from '../lib/database'
import {
  getCurrentUserProfile,
  updateUserProfile,
  type UserProfile
} from '../lib/supabase'

// =============================================
// QUERY KEYS
// =============================================

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
}

export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters: string) => [...animalKeys.lists(), { filters }] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  byClient: (clientId: string) => [...animalKeys.all, 'client', clientId] as const,
  search: (query: string) => [...animalKeys.all, 'search', query] as const,
}

export const statsKeys = {
  all: ['stats'] as const,
  clients: () => [...statsKeys.all, 'clients'] as const,
}

export const userProfileKeys = {
  all: ['userProfile'] as const,
  profile: () => [...userProfileKeys.all, 'profile'] as const,
}

// =============================================
// CLIENT HOOKS
// =============================================

export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: getClients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: () => searchClients(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      
      // Add the new client to the cache
      queryClient.setQueryData(clientKeys.detail(newClient.id), newClient)
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) => 
      updateClient(id, data),
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient)
      
      // Invalidate clients list to refresh
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: animalKeys.byClient(deletedId) })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

// =============================================
// ANIMAL HOOKS
// =============================================

export const useAnimals = () => {
  return useQuery({
    queryKey: animalKeys.lists(),
    queryFn: getAnimals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => getAnimalById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useAnimalsByClient = (clientId: string) => {
  return useQuery({
    queryKey: animalKeys.byClient(clientId),
    queryFn: () => getAnimalsByClient(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSearchAnimals = (query: string) => {
  return useQuery({
    queryKey: animalKeys.search(query),
    queryFn: () => searchAnimals(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  })
}

export const useCreateAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAnimal,
    onSuccess: (newAnimal) => {
      // Invalidate and refetch animals list
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Add the new animal to the cache
      queryClient.setQueryData(animalKeys.detail(newAnimal.id), newAnimal)
      
      // Update client's animals list
      queryClient.invalidateQueries({ 
        queryKey: animalKeys.byClient(newAnimal.client_id) 
      })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAnimalData> }) => 
      updateAnimal(id, data),
    onSuccess: (updatedAnimal) => {
      // Update the animal in the cache
      queryClient.setQueryData(animalKeys.detail(updatedAnimal.id), updatedAnimal)
      
      // Invalidate animals list to refresh
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Update client's animals list
      queryClient.invalidateQueries({ 
        queryKey: animalKeys.byClient(updatedAnimal.client_id) 
      })
    },
  })
}

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: animalKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() })
      
      // Update stats
      queryClient.invalidateQueries({ queryKey: statsKeys.clients() })
    },
  })
}

// =============================================
// STATS HOOKS
// =============================================

export const useClientStats = () => {
  return useQuery({
    queryKey: statsKeys.clients(),
    queryFn: getClientStats,
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  })
}

// =============================================
// USER PROFILE HOOKS
// =============================================

export const useUserProfile = () => {
  return useQuery({
    queryKey: userProfileKeys.profile(),
    queryFn: getCurrentUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateUserProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the profile in the cache
      queryClient.setQueryData(userProfileKeys.profile(), updatedProfile)
      
      // Also invalidate auth session to get updated user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
    },
  })
}
