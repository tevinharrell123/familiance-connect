
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Chore } from '@/types/chores';

export function useChores() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { household } = useAuth();

  const fetchChores = async () => {
    if (!household) {
      setChores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('household_chores')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data into Chore type
      const formattedChores: Chore[] = data.map(chore => ({
        id: chore.id,
        household_id: chore.household_id,
        title: chore.title,
        description: chore.description,
        assigned_to: chore.assigned_to,
        weekdays: chore.weekdays || [],
        frequency: chore.frequency || 'weekly',
        points: chore.points || 1,
        completed_dates: chore.completed_dates || [],
        created_at: chore.created_at,
        updated_at: chore.updated_at,
        assigned_to_name: chore.user_profiles?.full_name || null
      }));

      setChores(formattedChores);
    } catch (err: any) {
      console.error('Error fetching chores:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChores();
  }, [household]);

  return {
    chores,
    isLoading,
    error,
    refreshChores: fetchChores
  };
}
