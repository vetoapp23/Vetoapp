import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
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
  type CreateAnimalData,
  type CreateConsultationData
} from '../lib/database'
import {
  getCurrentUserProfile,
  updateUserProfile,
  type UserProfile
} from '../lib/supabase'
import {
  getPrescriptions,
  getPrescriptionsByAnimal,
  createPrescription,
  getStockItems,
  type Prescription,
  type CreatePrescriptionData,
  type StockItem
} from '../lib/database'

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
// CONSULTATION HOOKS
// =============================================

export const useConsultations = () => {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          animal:animals(*),
          client:clients(*)
        `)
        .order('consultation_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useConsultationsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['consultations', 'animal', animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('animal_id', animalId)
        .order('consultation_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!animalId,
  });
};

// Create consultation hook
export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateConsultationData & { consultation_date?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const consultationData = {
        ...data,
        veterinarian_id: user.id,
        consultation_date: data.consultation_date || new Date().toISOString(),
        status: 'completed' as const
      };

      const { data: consultation, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single();
      
      if (error) throw error;
      return consultation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Delete consultation hook
export const useDeleteConsultation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// =============================================
// VACCINATION HOOKS
// =============================================

export const useVaccinations = () => {
  return useQuery({
    queryKey: ['vaccinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaccinations')
        .select(`
          *,
          animal:animals(*),
          client:clients(*)
        `)
        .order('date_vaccination', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useVaccinationsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['vaccinations', 'animal', animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('animal_id', animalId)
        .order('date_vaccination', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!animalId,
  });
};

// =============================================
// STATISTICS HOOKS FOR DASHBOARD
// =============================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [animalsResult, clientsResult, consultationsResult] = await Promise.all([
        supabase.from('animals').select('id, species, status').eq('status', 'vivant'),
        supabase.from('clients').select('id, status').eq('status', 'actif'),
        supabase.from('consultations').select('id, consultation_date').gte('consultation_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()),
      ]);

      if (animalsResult.error || clientsResult.error || consultationsResult.error) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const animalsBySpecies = animalsResult.data?.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAnimals: animalsResult.data?.length || 0,
        totalClients: clientsResult.data?.length || 0,
        consultationsThisMonth: consultationsResult.data?.length || 0,
        animalsBySpecies: animalsBySpecies || {},
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const [clientsResult, animalsResult] = await Promise.all([
        supabase.from('clients').select('id, status'),
        supabase.from('animals').select('id, status')
      ]);

      if (clientsResult.error || animalsResult.error) {
        throw new Error('Failed to fetch client stats');
      }

      const activeClients = clientsResult.data?.filter(c => c.status === 'actif').length || 0;
      const totalClients = clientsResult.data?.length || 0;
      const totalAnimals = animalsResult.data?.length || 0;
      const animalsByStatus = animalsResult.data?.reduce((acc, animal) => {
        acc[animal.status] = (acc[animal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalClients: activeClients,
        totalAnimals,
        animalsByStatus,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =============================================
// PRESCRIPTION HOOKS
// =============================================

export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: getPrescriptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePrescriptionsByAnimal = (animalId: string) => {
  return useQuery({
    queryKey: ['prescriptions', 'animal', animalId],
    queryFn: () => getPrescriptionsByAnimal(animalId),
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// =============================================
// STOCK HOOKS
// =============================================

export const useStockItems = () => {
  return useQuery({
    queryKey: ['stock-items'],
    queryFn: getStockItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

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