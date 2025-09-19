import { supabase } from './supabase'

// =============================================
// CLIENT TYPES AND INTERFACES
// =============================================

export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile_phone?: string
  address?: string
  city: string
  postal_code?: string
  country: string
  notes?: string
  client_type: 'particulier' | 'eleveur' | 'ferme'
  status: 'actif' | 'inactif' | 'suspendu'
  created_at: string
  updated_at: string
}

export interface Animal {
  id: string
  client_id: string
  user_id: string
  name: string
  species: 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre'
  breed?: string
  color?: string
  sex?: 'Mâle' | 'Femelle' | 'Inconnu'
  weight?: number
  height?: number
  birth_date?: string
  microchip_number?: string
  tattoo_number?: string
  sterilized: boolean
  sterilization_date?: string
  status: 'vivant' | 'décédé' | 'perdu'
  death_date?: string
  death_cause?: string
  notes?: string
  photo_url?: string
  created_at: string
  updated_at: string
  
  // Relations
  client?: Client
}

export interface CreateClientData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile_phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  notes?: string
  client_type?: 'particulier' | 'eleveur' | 'ferme'
}

export interface CreateAnimalData {
  client_id: string
  name: string
  species: 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre'
  breed?: string
  color?: string
  sex?: 'Mâle' | 'Femelle' | 'Inconnu'
  weight?: number
  height?: number
  birth_date?: string
  microchip_number?: string
  tattoo_number?: string
  sterilized?: boolean
  sterilization_date?: string
  notes?: string
  photo_url?: string
}

// =============================================
// CLIENT OPERATIONS
// =============================================

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching clients: ${error.message}`)
  }

  return data || []
}

export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw new Error(`Error fetching client: ${error.message}`)
  }

  return data
}

export const createClient = async (clientData: CreateClientData): Promise<Client> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      user_id: user.id,
      city: clientData.city || 'Rabat',
      country: clientData.country || 'Maroc',
      client_type: clientData.client_type || 'particulier'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating client: ${error.message}`)
  }

  return data
}

export const updateClient = async (id: string, updates: Partial<CreateClientData>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating client: ${error.message}`)
  }

  return data
}

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting client: ${error.message}`)
  }
}

// =============================================
// ANIMAL OPERATIONS
// =============================================

export const getAnimals = async (): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching animals: ${error.message}`)
  }

  return data || []
}

export const getAnimalsByClient = async (clientId: string): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching animals for client: ${error.message}`)
  }

  return data || []
}

export const getAnimalById = async (id: string): Promise<Animal | null> => {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw new Error(`Error fetching animal: ${error.message}`)
  }

  return data
}

export const createAnimal = async (animalData: CreateAnimalData): Promise<Animal> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('animals')
    .insert({
      ...animalData,
      user_id: user.id,
      sterilized: animalData.sterilized || false,
      status: 'vivant'
    })
    .select(`
      *,
      client:clients(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error creating animal: ${error.message}`)
  }

  return data
}

export const updateAnimal = async (id: string, updates: Partial<CreateAnimalData>): Promise<Animal> => {
  const { data, error } = await supabase
    .from('animals')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      client:clients(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error updating animal: ${error.message}`)
  }

  return data
}

export const deleteAnimal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting animal: ${error.message}`)
  }
}

// =============================================
// SEARCH AND FILTER FUNCTIONS
// =============================================

export const searchClients = async (query: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error searching clients: ${error.message}`)
  }

  return data || []
}

export const searchAnimals = async (query: string): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .or(`name.ilike.%${query}%,species.ilike.%${query}%,breed.ilike.%${query}%,microchip_number.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error searching animals: ${error.message}`)
  }

  return data || []
}

export const getClientStats = async () => {
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('status')

  const { data: animalsData, error: animalsError } = await supabase
    .from('animals')
    .select('species, status')

  if (clientsError || animalsError) {
    throw new Error('Error fetching stats')
  }

  const clientsByStatus = clientsData?.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const animalsBySpecies = animalsData?.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const animalsByStatus = animalsData?.reduce((acc, animal) => {
    acc[animal.status] = (acc[animal.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    totalClients: clientsData?.length || 0,
    totalAnimals: animalsData?.length || 0,
    clientsByStatus,
    animalsBySpecies,
    animalsByStatus
  }
}
