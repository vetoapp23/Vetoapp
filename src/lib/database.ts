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
  cost?: number
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
  status?: 'healthy' | 'treatment' | 'urgent'
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

// =============================================
// CONSULTATION OPERATIONS
// =============================================

export const getConsultations = async (): Promise<Consultation[]> => {
  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      animal:animals(*),
      client:clients(*)
    `)
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
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      *,
      animal:animals(*)
    `)
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

  const { data, error } = await supabase
    .from('vaccinations')
    .insert({
      ...vaccinationData,
      administered_by: vaccinationData.administered_by || user.id
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

// =============================================
// PRESCRIPTION OPERATIONS
// =============================================

export const getPrescriptions = async (): Promise<Prescription[]> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      animal:animals(*),
      client:clients(*),
      medications:prescription_medications(*)
    `)
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
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      animal:animals(*)
    `)
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
