import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'assistant';
  status: 'pending' | 'approved' | 'rejected';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teamMembers', user?.organization_id],
    queryFn: async () => {
      console.log('🔍 useTeamMembers - Fetching team members...');
      console.log('🔍 useTeamMembers - User object:', user);
      console.log('🔍 useTeamMembers - Organization ID:', user?.organization_id);
      console.log('🔍 useTeamMembers - Profile Org ID:', user?.profile?.organization_id);
      
      if (!user?.organization_id) {
        console.error('❌ useTeamMembers - No organization_id found for user');
        console.error('❌ useTeamMembers - User details:', JSON.stringify(user, null, 2));
        throw new Error('Organization ID not found');
      }

      console.log('📡 useTeamMembers - Executing query with org_id:', user.organization_id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('organization_id', user.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useTeamMembers - Error fetching team members:', error);
        throw error;
      }

      console.log('✅ useTeamMembers - Team members found:', data?.length, 'members');
      console.log('📋 useTeamMembers - Team members data:', data);

      return data as TeamMember[];
    },
    enabled: !!user?.organization_id,
  });
};
