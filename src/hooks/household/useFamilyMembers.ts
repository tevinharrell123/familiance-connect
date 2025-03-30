
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HouseholdMember } from '@/types/household';

export function useFamilyMembers() {
  const [members, setMembers] = useState<HouseholdMember[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { household } = useAuth();

  const fetchMembers = async () => {
    if (!household) {
      setMembers(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', household.id);

      if (error) throw error;

      setMembers(data);
    } catch (err: any) {
      console.error('Error fetching household members:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [household]);

  return {
    members,
    isLoading,
    error,
    refreshMembers: fetchMembers
  };
}
