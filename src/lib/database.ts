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
  client_type: string // Now accepts any string value from app settings
  status: 'actif' | 'inactif' | 'suspendu'
  created_at: string
  updated_at: string
}

export interface Animal {
  id: string
  client_id: string
  user_id: string
  name: string
  species: string // Now accepts any string value from app settings
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

// =============================================
// MEDICAL RECORDS TYPES
// =============================================

export interface Consultation {
  id: string
  animal_id: string
  client_id: string
  veterinarian_id?: string
  consultation_date: string
  consultation_type: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  weight?: number
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  photos?: string[]
  follow_up_date?: string
  follow_up_notes?: string
  status: string
  created_at: string
  updated_at: string
  
  // UI compatibility fields
  followUp?: string | null
  
  // Relations
  animal?: Animal
  client?: Client
}

export interface Vaccination {
  id: string
  animal_id: string
  consultation_id?: string
  vaccine_name: string
  vaccine_type?: string
  batch_number?: string
  manufacturer?: string
  vaccination_date: string
  next_due_date?: string
  administered_by?: string
  notes?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
  
  // Relations
  animal?: Animal
}

export interface Prescription {
  id: string
  consultation_id: string
  animal_id: string
  client_id: string
  veterinarian_id?: string
  prescription_date: string
  diagnosis?: string
  notes?: string
  status: 'active' | 'completed' | 'cancelled'
  refill_count: number
  valid_until?: string
  created_at: string
  updated_at: string
  
  // Relations
  animal?: Animal
  client?: Client
  medications?: PrescriptionMedication[]
}

export interface PrescriptionMedication {
  id: string
  prescription_id: string
  stock_item_id?: string
  medication_name: string
  dosage?: string
  frequency?: string
  duration?: string
  quantity: number
  instructions?: string
  route?: string
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  animal_id?: string
  veterinarian_id?: string
  appointment_date: string
  duration_minutes: number
  appointment_type: 'consultation' | 'vaccination' | 'surgery' | 'follow-up'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
  
  // Relations
  client?: Client
  animal?: Animal
}

// =============================================
// INVENTORY TYPES
// =============================================

export interface StockItem {
  id: string
  name: string
  description?: string
  category: 'medication' | 'vaccine' | 'consumable' | 'equipment' | 'supplement'
  unit: string
  current_quantity: number
  minimum_quantity: number
  maximum_quantity?: number
  unit_cost?: number
  selling_price?: number
  supplier?: string
  batch_number?: string
  expiration_date?: string
  location?: string
  requires_prescription: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  stock_item_id: string
  movement_type: 'in' | 'out' | 'adjustment' | 'return'
  quantity: number
  reason?: string
  reference_id?: string
  reference_type?: string
  performed_by?: string
  notes?: string
  movement_date: string
  created_at: string
  
  // Relations
  stock_item?: StockItem
}

// =============================================
// SPECIALIZED FEATURES TYPES
// =============================================

export interface Antiparasitic {
  id: string
  animal_id: string
  consultation_id?: string
  product_name: string
  active_ingredient?: string
  parasite_type?: string
  administration_route?: string
  dosage?: string
  treatment_date: string
  next_treatment_date?: string
  administered_by?: string
  effectiveness_rating?: number
  notes?: string
  created_at: string
  updated_at: string
  
  // Relations
  animal?: Animal
}

export interface VaccinationProtocol {
  id: string
  species: string
  vaccine_name: string
  vaccine_type: string
  age_recommendation?: string
  frequency?: string
  duration_days?: number
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface AntiparasiticProtocol {
  id: string
  user_id: string
  species: string
  parasite_type: string
  product_name: string
  active_ingredient?: string
  administration_route?: string
  dosage_per_kg?: string
  frequency?: string
  age_restriction?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

// =============================================
// SUMMARY & STATS TYPES
// =============================================

export interface AppSetting {
  id: string
  user_id: string
  setting_category: string
  setting_key: string
  setting_value: any // JSON value
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClinicSettings {
  clinicName: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  currency: string
  footer_text?: string
}

export interface VeterinarianSetting {
  id: string
  name: string
  title: string
  specialty?: string
  phone?: string
  email?: string
  is_active: boolean
}

export interface FarmManagementSettings {
  farm_types: string[]
  animal_categories: string[]
  breeds_by_category: Record<string, string[]>
  certification_types: string[]
  equipment_types: string[]
  default_surface_unit: string
  default_coordinate_format: string
}

export interface ScheduleSettings {
  opening_time: string
  closing_time: string
  slot_duration: number
  lunch_break_start: string
  lunch_break_end: string
  working_days: string[]
}

export interface AnimalMedicalSummary {
  animal_id: string
  animal_name: string
  species: string
  breed?: string
  owner_name: string
  total_consultations: number
  last_consultation?: string
  total_vaccinations: number
  last_vaccination?: string
  active_prescriptions: number
  upcoming_appointments: number
}

export interface VaccinationReminder {
  id: string
  animal_name: string
  owner_name: string
  phone?: string
  email?: string
  vaccine_name: string
  next_due_date: string
  reminder_status: 'Overdue' | 'Due Soon' | 'Upcoming'
}

// =============================================
// CREATE/UPDATE DATA TYPES
// =============================================

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
  client_type?: string // Now accepts any string value from app settings
}

export interface CreateAnimalData {
  client_id: string
  name: string
  species: string
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
  status?: 'vivant' | 'décédé' | 'perdu'
}

export interface CreateConsultationData {
  animal_id: string
  client_id: string
  veterinarian_id?: string
  consultation_date?: string
  consultation_type: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  weight?: number
  temperature?: number
  heart_rate?: number
  respiratory_rate?: number
  photos?: string[]
  follow_up_date?: string
  follow_up_notes?: string
  status?: string
  cost?: number
}

export interface CreateVaccinationData {
  animal_id: string
  consultation_id?: string
  vaccine_name: string
  vaccine_type?: string
  batch_number?: string
  manufacturer?: string
  vaccination_date: string
  next_due_date?: string
  administered_by?: string
  notes?: string
}

export interface CreateAntiparasiticData {
  animal_id: string
  consultation_id?: string
  product_name: string
  active_ingredient?: string
  parasite_type?: string
  administration_route?: string
  dosage?: string
  treatment_date: string
  next_treatment_date?: string
  administered_by?: string
  effectiveness_rating?: number
  notes?: string
}

export interface CreatePrescriptionData {
  consultation_id: string
  animal_id: string
  client_id: string
  veterinarian_id?: string
  prescription_date?: string
  diagnosis?: string
  notes?: string
  status?: string
  refill_count?: number
  valid_until?: string
  medications: {
    stock_item_id?: string
    medication_name: string
    dosage?: string
    frequency?: string
    duration?: string
    quantity: number
    instructions?: string
    route?: string
  }[]
}

export interface CreateAppointmentData {
  client_id: string
  animal_id?: string
  veterinarian_id?: string
  appointment_date: string
  duration_minutes?: number
  appointment_type: 'consultation' | 'vaccination' | 'surgery' | 'follow-up'
  notes?: string
}

export interface UpdateAppointmentData {
  client_id?: string
  animal_id?: string
  veterinarian_id?: string
  appointment_date?: string
  duration_minutes?: number
  appointment_type?: 'consultation' | 'vaccination' | 'surgery' | 'follow-up'
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  reminder_sent?: boolean
}

// =============================================
// CLIENT OPERATIONS
// =============================================

export const getClients = async (): Promise<Client[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch clients')
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
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
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch animals')
  }

  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('user_id', user.id)
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
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch animal')
  }

  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
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

  // Handle empty fields to avoid database constraint violations
  const cleanAnimalData = { ...animalData };
  
  // Handle empty microchip numbers
  if ('microchip_number' in cleanAnimalData && !cleanAnimalData.microchip_number?.trim()) {
    delete cleanAnimalData.microchip_number;
  }
  
  // Handle empty date fields - remove them so they become NULL
  if ('birth_date' in cleanAnimalData && !cleanAnimalData.birth_date?.trim()) {
    delete cleanAnimalData.birth_date;
  }
  
  if ('sterilization_date' in cleanAnimalData && !cleanAnimalData.sterilization_date?.trim()) {
    delete cleanAnimalData.sterilization_date;
  }

  // Map UI status to database status
  const mapStatusToDatabase = (uiStatus?: string): 'vivant' | 'décédé' | 'perdu' => {
    switch (uiStatus) {
      case 'healthy':
        return 'vivant';
      case 'urgent':
        return 'décédé';
      case 'treatment':
        return 'perdu'; // Based on convertAnimalToPet mapping: perdu -> treatment
      default:
        return 'vivant'; // Default to vivant
    }
  };

  const { data, error } = await supabase
    .from('animals')
    .insert({
      ...cleanAnimalData,
      user_id: user.id,
      sterilized: cleanAnimalData.sterilized || false,
      status: mapStatusToDatabase(cleanAnimalData.status)
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
  // Handle empty fields to avoid database constraint violations
  const cleanUpdates = { ...updates };
  
  // Handle empty microchip numbers
  if ('microchip_number' in cleanUpdates && !cleanUpdates.microchip_number?.trim()) {
    cleanUpdates.microchip_number = null;
  }
  
  // Handle empty date fields - convert empty strings to null
  if ('birth_date' in cleanUpdates && !cleanUpdates.birth_date?.trim()) {
    cleanUpdates.birth_date = null;
  }
  
  if ('sterilization_date' in cleanUpdates && !cleanUpdates.sterilization_date?.trim()) {
    cleanUpdates.sterilization_date = null;
  }

  const { data, error } = await supabase
    .from('animals')
    .update(cleanUpdates)
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
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to search clients')
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error searching clients: ${error.message}`)
  }

  return data || []
}

export const searchAnimals = async (query: string): Promise<Animal[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to search animals')
  }

  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('user_id', user.id)
    .or(`name.ilike.%${query}%,species.ilike.%${query}%,breed.ilike.%${query}%,microchip_number.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error searching animals: ${error.message}`)
  }

  return data || []
}

export const getClientStats = async () => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch client stats')
  }

  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('status')
    .eq('user_id', user.id)

  const { data: animalsData, error: animalsError } = await supabase
    .from('animals')
    .select('species, status')
    .eq('user_id', user.id)

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

// =============================================
// CONSULTATION OPERATIONS
// =============================================

export const getConsultations = async (): Promise<Consultation[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch consultations')
  }

  // First get user's animals to filter consultations
  const { data: userAnimals, error: animalsError } = await supabase
    .from('animals')
    .select('id')
    .eq('user_id', user.id)

  if (animalsError) {
    throw new Error(`Error fetching user animals: ${animalsError.message}`)
  }

  const animalIds = userAnimals?.map(animal => animal.id) || []

  if (animalIds.length === 0) {
    return [] // No animals, no consultations
  }

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      animal:animals(*),
      client:clients(*)
    `)
    .in('animal_id', animalIds)
    .order('consultation_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching consultations: ${error.message}`)
  }

  return data || []
}

export const getConsultationsByAnimal = async (animalId: string): Promise<Consultation[]> => {
  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      animal:animals(*),
      client:clients(*)
    `)
    .eq('animal_id', animalId)
    .order('consultation_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching consultations for animal: ${error.message}`)
  }

  return data || []
}

export const createConsultation = async (consultationData: CreateConsultationData): Promise<Consultation> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('consultations')
    .insert({
      ...consultationData,
      veterinarian_id: consultationData.veterinarian_id || user.id
    })
    .select(`
      *,
      animal:animals(*),
      client:clients(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error creating consultation: ${error.message}`)
  }

  return data
}

export const updateConsultation = async (id: string, updates: Partial<CreateConsultationData>): Promise<Consultation> => {
  const { data, error } = await supabase
    .from('consultations')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      animal:animals(*),
      client:clients(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error updating consultation: ${error.message}`)
  }

  return data
}

// =============================================
// VACCINATION OPERATIONS
// =============================================

export const getVaccinations = async (): Promise<Vaccination[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch vaccinations')
  }

  // First get user's animals to filter vaccinations
  const { data: userAnimals, error: animalsError } = await supabase
    .from('animals')
    .select('id')
    .eq('user_id', user.id)

  if (animalsError) {
    throw new Error(`Error fetching user animals: ${animalsError.message}`)
  }

  const animalIds = userAnimals?.map(animal => animal.id) || []

  if (animalIds.length === 0) {
    return [] // No animals, no vaccinations
  }

  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      animal:animals(*)
    `)
    .in('animal_id', animalIds)
    .order('vaccination_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching vaccinations: ${error.message}`)
  }

  return data || []
}

export const getVaccinationsByAnimal = async (animalId: string): Promise<Vaccination[]> => {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      animal:animals(*)
    `)
    .eq('animal_id', animalId)
    .order('vaccination_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching vaccinations for animal: ${error.message}`)
  }

  return data || []
}

export const createVaccination = async (vaccinationData: CreateVaccinationData): Promise<Vaccination> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Ensure administered_by is either a valid UUID or null
  let administeredBy = vaccinationData.administered_by;
  if (!administeredBy || administeredBy.trim() === '') {
    // Check if the current user has a profile in user_profiles
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    administeredBy = userProfile ? user.id : null;
  }

  const { data, error } = await supabase
    .from('vaccinations')
    .insert({
      ...vaccinationData,
      administered_by: administeredBy
    })
    .select(`
      *,
      animal:animals(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error creating vaccination: ${error.message}`)
  }

  return data
}

export const updateVaccination = async (id: string, updates: Partial<CreateVaccinationData>): Promise<Vaccination> => {
  const { data, error } = await supabase
    .from('vaccinations')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      animal:animals(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error updating vaccination: ${error.message}`)
  }

  return data
}

export const deleteVaccination = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vaccinations')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting vaccination: ${error.message}`)
  }
}

// =============================================
// VACCINATION PROTOCOL OPERATIONS
// =============================================

export const getVaccinationProtocols = async (): Promise<VaccinationProtocol[]> => {
  const { data, error } = await supabase
    .from('vaccination_protocols')
    .select('*')
    .order('species', { ascending: true })
    .order('vaccine_name', { ascending: true })

  if (error) {
    throw new Error(`Error fetching vaccination protocols: ${error.message}`)
  }

  return data || []
}

export const getVaccinationProtocolsBySpecies = async (species: string): Promise<VaccinationProtocol[]> => {
  const { data, error } = await supabase
    .from('vaccination_protocols')
    .select('*')
    .eq('species', species)
    .eq('active', true)
    .order('vaccine_name', { ascending: true })

  if (error) {
    throw new Error(`Error fetching vaccination protocols for species: ${error.message}`)
  }

  return data || []
}

export const createVaccinationProtocol = async (protocolData: Omit<VaccinationProtocol, 'id' | 'created_at' | 'updated_at'>): Promise<VaccinationProtocol> => {
  const { data, error } = await supabase
    .from('vaccination_protocols')
    .insert(protocolData)
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating vaccination protocol: ${error.message}`)
  }

  return data
}

export const updateVaccinationProtocol = async (id: string, updates: Partial<VaccinationProtocol>): Promise<VaccinationProtocol> => {
  const { data, error } = await supabase
    .from('vaccination_protocols')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating vaccination protocol: ${error.message}`)
  }

  return data
}

export const deleteVaccinationProtocol = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vaccination_protocols')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting vaccination protocol: ${error.message}`)
  }
}

// =============================================
// ANTIPARASITIC OPERATIONS
// =============================================

export const getAntiparasitics = async (): Promise<Antiparasitic[]> => {
  const { data, error } = await supabase
    .from('antiparasitics')
    .select(`
      *,
      animal:animals(*)
    `)
    .order('treatment_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching antiparasitics: ${error.message}`)
  }

  return data || []
}

export const getAntiparasiticsByAnimal = async (animalId: string): Promise<Antiparasitic[]> => {
  const { data, error } = await supabase
    .from('antiparasitics')
    .select(`
      *,
      animal:animals(*)
    `)
    .eq('animal_id', animalId)
    .order('treatment_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching antiparasitics for animal: ${error.message}`)
  }

  return data || []
}

export const createAntiparasitic = async (antiparasiticData: CreateAntiparasiticData): Promise<Antiparasitic> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to create antiparasitic')
  }

  // Clean the data and ensure effectiveness_rating is properly handled
  const cleanedData = { ...antiparasiticData };
  
  // Remove effectiveness_rating if it's not a valid number between 1-5
  if (cleanedData.effectiveness_rating !== undefined) {
    const rating = cleanedData.effectiveness_rating;
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || isNaN(rating)) {
      console.warn('Invalid effectiveness_rating detected, removing from data:', rating);
      delete cleanedData.effectiveness_rating;
    }
  }

  console.log('Final antiparasitic data being sent to database:', cleanedData);

  // Validate administered_by field if provided
  if (cleanedData.administered_by) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', cleanedData.administered_by)
      .single()
    
    if (!profile) {
      console.warn('administered_by user not found, removing field')
      delete cleanedData.administered_by
    }
  }

  const { data, error } = await supabase
    .from('antiparasitics')
    .insert([cleanedData])
    .select(`
      *,
      animal:animals(*)
    `)
    .single()

  if (error) {
    console.error('Database error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      data: cleanedData
    })
    throw new Error(`Error creating antiparasitic: ${error.message} (Code: ${error.code})`)
  }

  return data
}

export const updateAntiparasitic = async (id: string, updates: Partial<CreateAntiparasiticData>): Promise<Antiparasitic> => {
  // Validate administered_by field if provided
  if (updates.administered_by) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', updates.administered_by)
      .single()
    
    if (!profile) {
      console.warn('administered_by user not found, setting to null')
      updates.administered_by = null
    }
  }

  const { data, error } = await supabase
    .from('antiparasitics')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      animal:animals(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error updating antiparasitic: ${error.message}`)
  }

  return data
}

export const deleteAntiparasitic = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('antiparasitics')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting antiparasitic: ${error.message}`)
  }
}

// Antiparasitic Protocol Operations
export const getAntiparasiticProtocols = async (): Promise<AntiparasiticProtocol[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch antiparasitic protocols')
  }

  const { data, error } = await supabase
    .from('antiparasitic_protocols')
    .select('*')
    .eq('user_id', user.id)
    .order('species', { ascending: true })

  if (error) {
    throw new Error(`Error fetching antiparasitic protocols: ${error.message}`)
  }

  return data || []
}

export const getAntiparasiticProtocolsBySpecies = async (species: string): Promise<AntiparasiticProtocol[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch antiparasitic protocols')
  }

  const { data, error } = await supabase
    .from('antiparasitic_protocols')
    .select('*')
    .eq('user_id', user.id)
    .eq('species', species)
    .eq('active', true)
    .order('parasite_type', { ascending: true })

  if (error) {
    throw new Error(`Error fetching antiparasitic protocols for species: ${error.message}`)
  }

  return data || []
}

export const createAntiparasiticProtocol = async (protocolData: Omit<AntiparasiticProtocol, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AntiparasiticProtocol> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to create antiparasitic protocol')
  }

  // Add user_id to the protocol data
  const protocolWithUserId = {
    ...protocolData,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('antiparasitic_protocols')
    .insert([protocolWithUserId])
    .select('*')
    .single()

  if (error) {
    throw new Error(`Error creating antiparasitic protocol: ${error.message}`)
  }

  return data
}

export const updateAntiparasiticProtocol = async (id: string, updates: Partial<Omit<AntiparasiticProtocol, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<AntiparasiticProtocol> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to update antiparasitic protocol')
  }
  const { data, error } = await supabase
    .from('antiparasitic_protocols')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Error updating antiparasitic protocol: ${error.message}`)
  }

  return data
}

export const deleteAntiparasiticProtocol = async (id: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to delete antiparasitic protocol')
  }
  const { error } = await supabase
    .from('antiparasitic_protocols')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting antiparasitic protocol: ${error.message}`)
  }
}

// =============================================
// PRESCRIPTION OPERATIONS
// =============================================

export const getPrescriptions = async (): Promise<Prescription[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch prescriptions')
  }

  // First get user's animals to filter prescriptions
  const { data: userAnimals, error: animalsError } = await supabase
    .from('animals')
    .select('id')
    .eq('user_id', user.id)

  if (animalsError) {
    throw new Error(`Error fetching user animals: ${animalsError.message}`)
  }

  const animalIds = userAnimals?.map(animal => animal.id) || []

  if (animalIds.length === 0) {
    return [] // No animals, no prescriptions
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      animal:animals(*),
      client:clients(*),
      medications:prescription_medications(*)
    `)
    .in('animal_id', animalIds)
    .order('prescription_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching prescriptions: ${error.message}`)
  }

  return data || []
}

export const getPrescriptionsByAnimal = async (animalId: string): Promise<Prescription[]> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      animal:animals(*),
      client:clients(*),
      medications:prescription_medications(*)
    `)
    .eq('animal_id', animalId)
    .order('prescription_date', { ascending: false })

  if (error) {
    throw new Error(`Error fetching prescriptions for animal: ${error.message}`)
  }

  return data || []
}

export const createPrescription = async (prescriptionData: CreatePrescriptionData): Promise<Prescription> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Extract medications from the data
  const { medications, ...prescriptionDataWithoutMedications } = prescriptionData

  // Create the prescription first
  const { data: prescriptionResult, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({
      ...prescriptionDataWithoutMedications,
      veterinarian_id: prescriptionDataWithoutMedications.veterinarian_id || user.id
    })
    .select()
    .single()

  if (prescriptionError) {
    throw new Error(`Error creating prescription: ${prescriptionError.message}`)
  }

  // Then create the medications
  if (medications && medications.length > 0) {
    const medicationsWithPrescriptionId = medications.map(med => ({
      ...med,
      prescription_id: prescriptionResult.id
    }))

    const { error: medicationsError } = await supabase
      .from('prescription_medications')
      .insert(medicationsWithPrescriptionId)

    if (medicationsError) {
      throw new Error(`Error creating prescription medications: ${medicationsError.message}`)
    }
  }

  // Return the complete prescription with medications
  const { data: completeData, error: completeError } = await supabase
    .from('prescriptions')
    .select(`
      *,
      animal:animals(*),
      client:clients(*),
      medications:prescription_medications(*)
    `)
    .eq('id', prescriptionResult.id)
    .single()

  if (completeError) {
    throw new Error(`Error fetching complete prescription: ${completeError.message}`)
  }

  return completeData
}

// =============================================
// APPOINTMENT OPERATIONS
// =============================================

export const getAppointments = async (): Promise<Appointment[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch appointments')
  }

  // First get user's clients to filter appointments
  const { data: userClients, error: clientsError } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)

  if (clientsError) {
    throw new Error(`Error fetching user clients: ${clientsError.message}`)
  }

  const clientIds = userClients?.map(client => client.id) || []

  if (clientIds.length === 0) {
    return [] // No clients, no appointments
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
    .in('client_id', clientIds)
    .order('appointment_date', { ascending: true })

  if (error) {
    throw new Error(`Error fetching appointments: ${error.message}`)
  }

  return data || []
}

export const getAppointmentsByAnimal = async (animalId: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
    .eq('animal_id', animalId)
    .order('appointment_date', { ascending: true })

  if (error) {
    throw new Error(`Error fetching appointments for animal: ${error.message}`)
  }

  return data || []
}

export const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointmentData,
      veterinarian_id: appointmentData.veterinarian_id || user.id,
      duration_minutes: appointmentData.duration_minutes || 30
    })
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error creating appointment: ${error.message}`)
  }

  return data
}

export const updateAppointment = async (id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      ...appointmentData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
    .single()

  if (error) {
    throw new Error(`Error updating appointment: ${error.message}`)
  }

  return data
}

export const deleteAppointment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error deleting appointment: ${error.message}`)
  }
}

export const getAppointmentsByClient = async (clientId: string): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
    .eq('client_id', clientId)
    .order('appointment_date', { ascending: true })

  if (error) {
    throw new Error(`Error fetching appointments for client: ${error.message}`)
  }

  return data || []
}

// =============================================
// STOCK OPERATIONS
// =============================================

export const getStockItems = async (): Promise<StockItem[]> => {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Error fetching stock items: ${error.message}`)
  }

  return data || []
}

export const getLowStockItems = async (): Promise<StockItem[]> => {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .eq('active', true)
    .filter('current_quantity', 'lte', 'minimum_quantity')
    .order('current_quantity', { ascending: true })

  if (error) {
    throw new Error(`Error fetching low stock items: ${error.message}`)
  }

  return data || []
}

// =============================================
// MEDICAL SUMMARY & STATISTICS
// =============================================

export const getAnimalMedicalSummary = async (animalId: string): Promise<AnimalMedicalSummary | null> => {
  const { data, error } = await supabase
    .from('animal_medical_summary')
    .select('*')
    .eq('animal_id', animalId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw new Error(`Error fetching animal medical summary: ${error.message}`)
  }

  return data
}

export const getVaccinationReminders = async (): Promise<VaccinationReminder[]> => {
  const { data, error } = await supabase
    .from('vaccination_reminders')
    .select('*')
    .order('next_due_date', { ascending: true })

  if (error) {
    throw new Error(`Error fetching vaccination reminders: ${error.message}`)
  }

  return data || []
}

// =============================================
// ENHANCED STATISTICS
// =============================================

export const getDetailedStats = async () => {
  // Get basic stats
  const basicStats = await getClientStats()
  
  // Get consultation stats
  const { data: consultationsData, error: consultationsError } = await supabase
    .from('consultations')
    .select('consultation_type, status, consultation_date, cost')

  // Get vaccination stats  
  const { data: vaccinationsData, error: vaccinationsError } = await supabase
    .from('vaccinations')
    .select('vaccination_date, vaccine_name')

  // Get appointment stats
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('appointment_date, status, appointment_type')

  if (consultationsError || vaccinationsError || appointmentsError) {
    throw new Error('Error fetching detailed stats')
  }

  // Calculate consultation stats
  const consultationsByType = consultationsData?.reduce((acc, consultation) => {
    acc[consultation.consultation_type] = (acc[consultation.consultation_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const consultationsByStatus = consultationsData?.reduce((acc, consultation) => {
    acc[consultation.status] = (acc[consultation.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate monthly consultations
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const monthlyConsultations = consultationsData?.filter(consultation => {
    const consultationDate = new Date(consultation.consultation_date)
    return consultationDate.getMonth() === currentMonth && consultationDate.getFullYear() === currentYear
  }).length || 0

  // Calculate vaccination stats
  const vaccinationsByType = vaccinationsData?.reduce((acc, vaccination) => {
    acc[vaccination.vaccine_name] = (acc[vaccination.vaccine_name] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate appointment stats
  const appointmentsByStatus = appointmentsData?.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const upcomingAppointments = appointmentsData?.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date)
    return appointmentDate > currentDate && appointment.status === 'scheduled'
  }).length || 0

  // Calculate total revenue
  const totalRevenue = consultationsData?.reduce((total, consultation) => {
    return total + (consultation.cost || 0)
  }, 0) || 0

  return {
    ...basicStats,
    totalConsultations: consultationsData?.length || 0,
    totalVaccinations: vaccinationsData?.length || 0,
    totalAppointments: appointmentsData?.length || 0,
    monthlyConsultations,
    upcomingAppointments,
    totalRevenue,
    consultationsByType,
    consultationsByStatus,
    vaccinationsByType,
    appointmentsByStatus
  }
}

// =============================================
// APP SETTINGS OPERATIONS
// =============================================

export const getAppSettings = async (): Promise<AppSetting[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch app settings')
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('setting_category', { ascending: true })

  if (error) {
    throw new Error(`Error fetching app settings: ${error.message}`)
  }

  return data || []
}

export const getAppSettingsByCategory = async (category: string): Promise<AppSetting[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch app settings')
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .eq('setting_category', category)
    .eq('is_active', true)
    .order('setting_key', { ascending: true })

  if (error) {
    throw new Error(`Error fetching app settings for category: ${error.message}`)
  }

  return data || []
}

export const getAppSetting = async (category: string, key: string): Promise<AppSetting | null> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to fetch app setting')
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .eq('setting_category', category)
    .eq('setting_key', key)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw new Error(`Error fetching app setting: ${error.message}`)
  }

  return data
}

export const createOrUpdateAppSetting = async (
  category: string, 
  key: string, 
  value: any, 
  description?: string
): Promise<AppSetting> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to create/update app setting')
  }

  // Try to update existing setting first
  const { data: existingData, error: existingError } = await supabase
    .from('app_settings')
    .update({ 
      setting_value: value, 
      description: description,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('setting_category', category)
    .eq('setting_key', key)
    .select()
    .single()

  if (!existingError && existingData) {
    return existingData
  }

  // If update failed, create new setting
  const { data, error } = await supabase
    .from('app_settings')
    .insert([{
      user_id: user.id,
      setting_category: category,
      setting_key: key,
      setting_value: value,
      description: description,
      is_active: true
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating app setting: ${error.message}`)
  }

  return data
}

export const deleteAppSetting = async (category: string, key: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to delete app setting')
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('setting_category', category)
    .eq('setting_key', key)

  if (error) {
    throw new Error(`Error deleting app setting: ${error.message}`)
  }
}

// =============================================
// SETTINGS HELPER FUNCTIONS
// =============================================

export const getClinicSettings = async (): Promise<ClinicSettings | null> => {
  const settings = await getAppSettingsByCategory('clinic')
  if (settings.length === 0) return null

  const clinicSettings: Partial<ClinicSettings> = {}
  settings.forEach(setting => {
    clinicSettings[setting.setting_key as keyof ClinicSettings] = setting.setting_value
  })

  return clinicSettings as ClinicSettings
}

export const updateClinicSettings = async (clinicSettings: Partial<ClinicSettings>): Promise<void> => {
  const promises = Object.entries(clinicSettings).map(([key, value]) =>
    createOrUpdateAppSetting('clinic', key, value, `Clinic ${key} setting`)
  )

  await Promise.all(promises)
}

export const getVeterinarianSettings = async (): Promise<VeterinarianSetting[]> => {
  const setting = await getAppSetting('clinic', 'veterinarians')
  return setting?.setting_value || []
}

export const updateVeterinarianSettings = async (veterinarians: VeterinarianSetting[]): Promise<void> => {
  await createOrUpdateAppSetting('clinic', 'veterinarians', veterinarians, 'List of veterinarians')
}

export const getFarmManagementSettings = async (): Promise<FarmManagementSettings | null> => {
  const setting = await getAppSetting('farm', 'management_settings')
  return setting?.setting_value || null
}

export const updateFarmManagementSettings = async (farmSettings: FarmManagementSettings): Promise<void> => {
  await createOrUpdateAppSetting('farm', 'management_settings', farmSettings, 'Farm management configuration')
}

export const getScheduleSettings = async (): Promise<ScheduleSettings | null> => {
  const setting = await getAppSetting('clinic', 'schedule_settings')
  return setting?.setting_value || null
}

export const updateScheduleSettings = async (scheduleSettings: ScheduleSettings): Promise<void> => {
  await createOrUpdateAppSetting('clinic', 'schedule_settings', scheduleSettings, 'Clinic schedule configuration')
}

// =============================================
// HELPER FUNCTIONS FOR INITIALIZING DEFAULT SETTINGS
// =============================================

export const initializeDefaultSettings = async (): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to initialize default settings')
  }

  // Check if user already has settings
  const existingSettings = await getAppSettings()
  if (existingSettings.length > 0) {
    console.log('User already has settings configured')
    return
  }

  // Create default clinic settings
  const defaultClinicSettings: ClinicSettings = {
    clinicName: 'Ma Clinique Vétérinaire',
    address: 'Rabat, Maroc',
    phone: '+212 5 37 XX XX XX',
    email: 'contact@clinique.ma',
    website: 'www.clinique.ma',
    currency: 'MAD',
    footer_text: 'Merci de votre confiance'
  }

  // Create default veterinarians
  const defaultVeterinarians: VeterinarianSetting[] = [
    {
      id: crypto.randomUUID(),
      name: 'Dr. Mohamed Alami',
      title: 'Vétérinaire Principal',
      specialty: 'Médecine générale',
      phone: '+212 6 XX XX XX XX',
      email: 'm.alami@clinique.ma',
      is_active: true
    }
  ]

  // Create default farm management settings
  const defaultFarmSettings: FarmManagementSettings = {
    enabled: true,
    default_herd_size: 50,
    visit_frequency_days: 30,
    report_format: 'standard',
    certification_tracking: true
  }

  // Create default schedule settings
  const defaultScheduleSettings: ScheduleSettings = {
    working_hours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '08:00', end: '14:00', enabled: true },
      sunday: { start: '08:00', end: '14:00', enabled: false }
    },
    appointment_duration: 30,
    buffer_time: 10,
    max_appointments_per_day: 20
  }

  // Save all default settings
  await Promise.all([
    updateClinicSettings(defaultClinicSettings),
    updateVeterinarianSettings(defaultVeterinarians),
    updateFarmManagementSettings(defaultFarmSettings),
    updateScheduleSettings(defaultScheduleSettings)
  ])

  console.log('Default settings initialized successfully')
}
